// Self-test for the correctness gate: feed it known-good and known-broken
// answers and assert it grades them right. Runs without any API key — this is
// what lets the gate ship verified even before a paid model eval is run.

const { test } = require('node:test');
const assert = require('node:assert');
const { grade, identifyTask } = require('./correctness.js');

const fence = (lang, code) => '```' + lang + '\n' + code + '\n```';

test('identifyTask maps the five tasks', () => {
  assert.equal(identifyTask('Write a Python email validator.'), 'email');
  assert.equal(identifyTask('Write a JavaScript debounce function.'), 'debounce');
  assert.equal(identifyTask('Sum a numeric column in a CSV in Python.'), 'csv');
  assert.equal(identifyTask('Write a React countdown timer component.'), 'countdown');
  assert.equal(identifyTask('Write a FastAPI rate limiter.'), 'ratelimit');
  assert.equal(identifyTask('something else'), null);
});

test('email: a working validator passes', () => {
  const out = fence('python', 'def validate_email(s):\n    return isinstance(s, str) and "@" in s and "." in s.split("@")[-1] and s.index("@") > 0');
  assert.equal(grade(out, 'Python email validator').pass, true);
});

test('email: a broken validator (accepts everything) fails', () => {
  const out = fence('python', 'def validate_email(s):\n    return True');
  assert.equal(grade(out, 'Python email validator').pass, false);
});

test('debounce: a real debounce passes', () => {
  const out = fence('javascript', 'function debounce(fn, ms){let t;return(...a)=>{clearTimeout(t);t=setTimeout(()=>fn(...a),ms);};}');
  assert.equal(grade(out, 'JavaScript debounce function').pass, true);
});

test('debounce: a no-op (fires immediately) fails', () => {
  const out = fence('javascript', 'function debounce(fn){return fn;}');
  assert.equal(grade(out, 'JavaScript debounce function').pass, false);
});

test('countdown: structural check passes on a plausible component', () => {
  const out = fence('jsx', 'function C(){const [n,setN]=useState(10);useEffect(()=>{const id=setInterval(()=>setN(p=>p-1),1000);return()=>clearInterval(id);},[]);return n;}');
  assert.equal(grade(out, 'React countdown timer component').pass, true);
});

test('no code block fails the gate', () => {
  assert.equal(grade('I would suggest using a library for this.', 'Python email validator').pass, false);
});
