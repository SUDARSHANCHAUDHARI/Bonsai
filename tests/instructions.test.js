const { test } = require('node:test');
const assert = require('node:assert');
const { filterSkillBodyForMode, getBonsaiInstructions } = require('../hooks/bonsai-instructions');
const { normalizeMode, getDefaultMode } = require('../hooks/bonsai-config');

const BODY = [
  '## Rules',
  '- No unrequested abstractions: keep this verbatim.',
  '## Intensity',
  '| **lite** | name the smaller alternative. |',
  '| **full** | the cut order enforced. |',
  '| **ultra** | YAGNI extremist. |',
  '- lite: lite example line',
  '- full: full example line',
  '- ultra: ultra example line',
].join('\n');

test('filter keeps only the active mode row + example', () => {
  const out = filterSkillBodyForMode(BODY, 'ultra');
  assert.match(out, /YAGNI extremist/);
  assert.doesNotMatch(out, /cut order enforced/);
  assert.doesNotMatch(out, /name the smaller alternative/);
  assert.match(out, /ultra example line/);
  assert.doesNotMatch(out, /full example line/);
});

test('filter never drops a non-mode rule bullet', () => {
  const out = filterSkillBodyForMode(BODY, 'lite');
  assert.match(out, /No unrequested abstractions: keep this verbatim\./);
});

test('normalizeMode only accepts the three levels', () => {
  assert.equal(normalizeMode('LITE'), 'lite');
  assert.equal(normalizeMode('off'), null);
  assert.equal(normalizeMode('garbage'), null);
});

test('getBonsaiInstructions reads the real skill and labels the level', () => {
  const out = getBonsaiInstructions('full');
  assert.match(out, /^BONSAI MODE ACTIVE — level: full/);
  assert.match(out, /cut order/i);
});

test('default mode is full with no config', () => {
  delete process.env.BONSAI_DEFAULT_MODE;
  assert.equal(getDefaultMode(), 'full');
});
