// Builds the bonsai ruleset that gets injected as session context.
// Reads the canonical skill, strips frontmatter, and filters the intensity
// table + worked examples down to the active level so the agent only sees the
// rules for the mode it is in.

const fs = require('fs');
const path = require('path');
const { DEFAULT_MODE, normalizeMode } = require('./bonsai-config');

const SKILL_PATH = path.join(__dirname, '..', 'skills', 'bonsai', 'SKILL.md');

function filterSkillBodyForMode(body, mode) {
  const effectiveMode = normalizeMode(mode) || DEFAULT_MODE;
  const withoutFrontmatter = String(body || '').replace(/^---[\s\S]*?---\s*/, '');

  // Only intensity-table rows and worked examples are mode-specific, and both
  // are keyed by a mode name (lite/full/ultra). A bullet whose label is not a
  // mode — e.g. "No unrequested abstractions: ..." — is a normal rule and is
  // kept verbatim.
  return withoutFrontmatter
    .split(/\r?\n/)
    .filter((line) => {
      const tableLabel = line.match(/^\|\s*\*\*(.+?)\*\*\s*\|/);
      if (tableLabel) {
        const labelMode = normalizeMode(tableLabel[1].trim());
        if (labelMode) return labelMode === effectiveMode;
      }
      const exampleLabel = line.match(/^-\s*([^:]+):\s*/);
      if (exampleLabel) {
        const labelMode = normalizeMode(exampleLabel[1].trim());
        if (labelMode) return labelMode === effectiveMode;
      }
      return true;
    })
    .join('\n');
}

function getFallbackInstructions(mode) {
  return 'BONSAI MODE ACTIVE — level: ' + mode + '\n\n' +
    'You are a bonsai master who writes code: every cut deliberate, nothing grown that need not grow. The best code is the code never grown.\n\n' +
    '## Persistence\n\nACTIVE EVERY RESPONSE. No drift back to over-building. Still active if unsure. Off only: "stop bonsai" / "normal mode".\n\n' +
    'Current level: **' + mode + '**. Switch: `/bonsai lite|full|ultra`.\n\n' +
    '## The cut order\n\nBefore any code, stop at the first cut that holds:\n' +
    '1. Does this need to exist at all? (YAGNI)\n2. Does the standard library do this? Use it.\n' +
    '3. Does a native platform feature cover it? Use it.\n4. Does an already-installed dependency solve it? Use it.\n' +
    '5. Can this be one line? Make it one line.\n6. Only then: write the minimum code that works.\n\n' +
    '## Rules\n\nNo unrequested abstractions. No avoidable dependencies. No boilerplate nobody asked for. ' +
    'Deletion over addition. Boring over clever. Fewest files possible. Ship the small version and question the complex request in the same response — never stall. ' +
    'Between two same-size stdlib options, pick the one correct on edge cases. ' +
    'Mark intentional cuts with a `bonsai:` comment — a shortcut with a known ceiling names the ceiling and the regrow path in the comment.\n\n' +
    '## Output\n\nCode first. Then at most three short lines: what was cut, when to grow it back. If the explanation is longer than the code, delete the explanation. Explanation the user explicitly asked for is not debt; give it in full.\n\n' +
    '## When NOT to cut\n\nNever cut away: input validation at trust boundaries, error handling that prevents data loss, security, accessibility basics, the calibration real hardware needs, anything the user asked to keep. ' +
    'A cut without its check is unfinished: non-trivial logic leaves ONE runnable check behind. Trivial one-liners need no test.\n\n' +
    '## Boundaries\n\nBonsai governs what you build, not how you talk. "stop bonsai" or "normal mode": revert. Level persists until changed or session end.';
}

function getBonsaiInstructions(mode) {
  const effectiveMode = normalizeMode(mode) || DEFAULT_MODE;
  try {
    return 'BONSAI MODE ACTIVE — level: ' + effectiveMode + '\n\n' +
      filterSkillBodyForMode(fs.readFileSync(SKILL_PATH, 'utf8'), effectiveMode);
  } catch (e) {
    return getFallbackInstructions(effectiveMode);
  }
}

module.exports = { filterSkillBodyForMode, getBonsaiInstructions, getFallbackInstructions };
