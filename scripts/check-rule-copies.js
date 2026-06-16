#!/usr/bin/env node
// Fails if any instruction-only adapter has drifted from the canonical compact
// ruleset block in AGENTS.md (the text between BONSAI:BEGIN / BONSAI:END).

const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const agents = fs.readFileSync(path.join(root, 'AGENTS.md'), 'utf8');
const m = agents.match(/<!-- BONSAI:BEGIN -->\n([\s\S]*?)<!-- BONSAI:END -->/);
if (!m) {
  console.error('AGENTS.md: missing BONSAI:BEGIN/END markers.');
  process.exit(1);
}
const canonical = m[1].trim();

const copies = [
  '.cursor/rules/bonsai.mdc',
  '.windsurf/rules/bonsai.md',
  '.clinerules/bonsai.md',
  '.github/copilot-instructions.md',
  '.kiro/steering/bonsai.md',
];

let drift = 0;
for (const rel of copies) {
  const text = fs.readFileSync(path.join(root, rel), 'utf8');
  if (!text.includes(canonical)) {
    console.error(`DRIFT: ${rel} no longer contains the canonical ruleset.`);
    drift++;
  }
}

if (drift) {
  console.error(`\n${drift} adapter(s) out of sync. Recopy the AGENTS.md block.`);
  process.exit(1);
}
console.log(`OK: ${copies.length} adapters match AGENTS.md.`);
