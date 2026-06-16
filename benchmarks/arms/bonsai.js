// Bonsai arm: the canonical ruleset (from AGENTS.md) prepended to the task.
const fs = require('fs');
const path = require('path');

const agents = fs.readFileSync(path.join(__dirname, '..', '..', 'AGENTS.md'), 'utf8');
const block = agents.match(/<!-- BONSAI:BEGIN -->\n([\s\S]*?)<!-- BONSAI:END -->/)[1].trim();

module.exports = ({ vars }) => `${block}\n\n${vars.task}`;
