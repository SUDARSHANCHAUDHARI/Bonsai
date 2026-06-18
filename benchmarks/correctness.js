// Functional correctness gate: runs generated code against lightweight checks
// per task, so "less code" can never mean "broken code". email/debounce/csv are
// executed (Python/Node); react/fastapi are structural (no runtime bundler).
//
// Metric: `correct` (1 = all checks pass, 0 = at least one fails). Unlike
// loc.js (measurement-only), this is a gate — a wrong answer is wrong no matter
// how few lines made it. Check logic adapted from the ponytail benchmark (MIT).

const { execSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

function extractBlocks(text) {
  text = String(text || '');
  const matches = [...text.matchAll(/```(\w*)\r?\n([\s\S]*?)```/g)];
  // Terse models often answer with bare, unfenced code; score the whole reply.
  if (matches.length === 0 && text.trim()) return [{ lang: '', code: text }];
  return matches.map((m) => ({ lang: (m[1] || '').toLowerCase(), code: m[2] }));
}

function identifyTask(task) {
  const t = String(task || '').toLowerCase();
  if (t.includes('email') && t.includes('valid')) return 'email';
  if (t.includes('debounce')) return 'debounce';
  if (t.includes('csv') && t.includes('sum')) return 'csv';
  if (t.includes('countdown') && t.includes('react')) return 'countdown';
  if (t.includes('rate limit') || t.includes('rate-limit')) return 'ratelimit';
  return null;
}

function exec(cmd, opts = {}) {
  try {
    execSync(cmd, { timeout: 10_000, encoding: 'utf8', stdio: 'pipe', ...opts });
    return { ok: true, stderr: '' };
  } catch (e) {
    return { ok: false, stderr: (e.stderr || e.message || '').slice(0, 500) };
  }
}

let pythonCmd;
function python() {
  if (pythonCmd) return pythonCmd;
  for (const cmd of ['python3', 'python']) {
    if (exec(`${cmd} -c "import sys"`).ok) { pythonCmd = cmd; return pythonCmd; }
  }
  pythonCmd = 'python3';
  return pythonCmd;
}

function tmpFile(ext, content) {
  const p = path.join(os.tmpdir(), `bonsai-bench-${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`);
  fs.writeFileSync(p, content);
  return p;
}

const CHECKS = {
  email(blocks) {
    const code = blocks.find((b) => b.lang === 'python' || b.lang === 'py' || (!b.lang && b.code.includes('def ')));
    if (!code) return { pass: false, reason: 'No Python code block found' };
    const harness = `
${code.code}

import sys, inspect
fn = None
for name in ['validate_email', 'is_valid_email', 'email_validator', 'is_valid', 'validate']:
    if name in dir() and callable(eval(name)):
        fn = eval(name); break
if fn is None:
    for name, obj in list(globals().items()):
        if callable(obj) and not name.startswith('_'):
            try:
                if len(inspect.signature(obj).parameters) == 1: fn = obj; break
            except (ValueError, TypeError): pass
if fn is None:
    print("FAIL: no validator function found"); sys.exit(1)
failures = []
if not fn("user@example.com"): failures.append("rejected valid: user@example.com")
if not fn("a@b.co"): failures.append("rejected valid: a@b.co")
if fn("no-at-sign"): failures.append("accepted invalid: no-at-sign")
if fn(""): failures.append("accepted invalid: empty")
if fn("@missing-local.com"): failures.append("accepted invalid: @missing-local.com")
if failures:
    print("FAIL: " + "; ".join(failures)); sys.exit(1)
print("PASS")
`;
    const f = tmpFile('.py', harness);
    const result = exec(`${python()} "${f}"`);
    try { fs.unlinkSync(f); } catch (e) {}
    return result.ok ? { pass: true, reason: 'Email validator passes all checks' }
                     : { pass: false, reason: result.stderr || 'Email validator failed' };
  },

  debounce(blocks) {
    const code = blocks.find((b) => b.lang === 'javascript' || b.lang === 'js' || (!b.lang && (b.code.includes('function') || b.code.includes('=>'))));
    if (!code) return { pass: false, reason: 'No JavaScript code block found' };
    const harness = `
${code.code}

const fn = typeof debounce === 'function' ? debounce
  : (typeof module !== 'undefined' && typeof module.exports === 'function') ? module.exports : null;
if (!fn) { console.error("FAIL: no debounce function found"); process.exit(1); }
let callCount = 0;
const debounced = fn(() => { callCount++; }, 50);
debounced(); debounced(); debounced();
if (callCount > 0) { console.error("FAIL: fired immediately"); process.exit(1); }
setTimeout(() => {
  if (callCount !== 1) { console.error("FAIL: expected 1 call, got " + callCount); process.exit(1); }
  console.log("PASS");
}, 120);
`;
    const f = tmpFile('.mjs', harness);
    const result = exec(`node "${f}"`);
    try { fs.unlinkSync(f); } catch (e) {}
    return result.ok ? { pass: true, reason: 'Debounce passes all checks' }
                     : { pass: false, reason: result.stderr || 'Debounce failed' };
  },

  csv(blocks) {
    const code = blocks.find((b) => b.lang === 'python' || b.lang === 'py' || (!b.lang && b.code.includes('csv') && b.code.includes('sum')));
    if (!code) return { pass: false, reason: 'No Python code block found' };
    const csvPath = tmpFile('.csv', 'name,amount\nAlice,100.5\nBob,200.0\nCharlie,50.5\n').replace(/\\/g, '/');
    let patched = code.code.replace(/['"]sales\.csv['"]/g, `'${csvPath}'`).replace(/open\(\s*['"]sales\.csv['"]/g, `open('${csvPath}'`);
    const harness = `
import sys, os, io, re
os.chdir(r"${path.dirname(csvPath)}")
_stdout = sys.stdout; sys.stdout = io.StringIO()
try:
${patched.split('\n').map((l) => '    ' + l).join('\n')}
except Exception:
    pass
output = sys.stdout.getvalue(); sys.stdout = _stdout
if re.search(r'(?<![\\d])351(?:\\.0)?(?![\\d])', output):
    print("PASS")
else:
    print("FAIL: output was: " + repr(output[:200])); sys.exit(1)
`;
    const f = tmpFile('.py', harness);
    const result = exec(`${python()} "${f}"`);
    try { fs.unlinkSync(f); } catch (e) {}
    try { fs.unlinkSync(csvPath); } catch (e) {}
    return result.ok ? { pass: true, reason: 'CSV sum produces 351' }
                     : { pass: false, reason: result.stderr || 'CSV sum failed' };
  },

  countdown(blocks) {
    // Task is already identified as countdown; grade the first block if no
    // block names "count"/"timer" explicitly.
    const code = blocks.find((b) => b.code.includes('ount') || b.code.includes('imer')) || blocks[0];
    if (!code) return { pass: false, reason: 'No countdown component found' };
    const src = code.code;
    const failures = [];
    if (!/useState|useReducer|this\.state/.test(src)) failures.push('no state');
    if (!/useEffect|componentDidMount|setInterval|setTimeout/.test(src)) failures.push('no timer');
    if (!/-\s*1\b|-=\s*1/.test(src)) failures.push('no decrement');
    return failures.length === 0 ? { pass: true, reason: 'Countdown has required structure' }
                                 : { pass: false, reason: 'Missing: ' + failures.join(', ') };
  },

  ratelimit(blocks) {
    const code = blocks.find((b) => b.lang === 'python' || b.lang === 'py' || (!b.lang && (b.code.includes('rate') || b.code.includes('limit'))));
    if (!code) return { pass: false, reason: 'No Python code block found' };
    const src = code.code;
    const failures = [];
    if (!/limit|max_requests|rate|429|Too Many|HTTPException|RateLimiter/.test(src)) failures.push('no rate limit logic');
    if (!/fastapi|FastAPI|app\s*=|@app\./.test(src)) failures.push('no FastAPI usage');
    return failures.length === 0 ? { pass: true, reason: 'Rate limiter has required structure' }
                                 : { pass: false, reason: 'Missing: ' + failures.join(', ') };
  },
};

function grade(output, task) {
  const which = identifyTask(task);
  if (!which) return { pass: true, score: 1, reason: 'Unknown task, skipped' };
  const blocks = extractBlocks(output);
  if (blocks.length === 0) return { pass: false, score: 0, reason: 'No code in output' };
  const r = CHECKS[which](blocks);
  return { pass: r.pass, score: r.pass ? 1 : 0, reason: r.reason };
}

// promptfoo javascript-assertion entry point.
module.exports = (output, context) => grade(String(output || ''), context?.vars?.task || '');
// Exposed for local self-tests.
module.exports.grade = grade;
module.exports.extractBlocks = extractBlocks;
module.exports.identifyTask = identifyTask;
