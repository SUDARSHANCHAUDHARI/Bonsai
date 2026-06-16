#!/usr/bin/env node
// bonsai — SessionStart activation hook (Claude Code + Codex)
//
// On every session start:
//   1. Write the mode flag file (statusline reads this)
//   2. Emit the bonsai ruleset, filtered to the active intensity, as context
//   3. On Claude Code, nudge to set up the statusline badge if missing

const fs = require('fs');
const path = require('path');
const { getDefaultMode, getClaudeDir } = require('./bonsai-config');
const { getBonsaiInstructions } = require('./bonsai-instructions');
const { clearMode, isCodex, setMode, writeHookOutput } = require('./bonsai-runtime');

const mode = getDefaultMode();

// "off" — skip activation entirely
if (mode === 'off') {
  clearMode();
  writeHookOutput('SessionStart', 'off', isCodex ? '' : 'OK');
  process.exit(0);
}

try { setMode(mode); } catch (e) { /* flag is best-effort */ }

let output = getBonsaiInstructions(mode);

// Statusline nudge — Claude Code only
if (!isCodex) try {
  const settingsPath = path.join(getClaudeDir(), 'settings.json');
  let hasStatusline = false;
  if (fs.existsSync(settingsPath)) {
    const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
    hasStatusline = Boolean(settings.statusLine);
  }
  if (!hasStatusline) {
    const isWindows = process.platform === 'win32';
    const scriptName = isWindows ? 'bonsai-statusline.ps1' : 'bonsai-statusline.sh';
    const scriptPath = path.join(__dirname, scriptName);
    const command = isWindows
      ? `powershell -ExecutionPolicy Bypass -File "${scriptPath}"`
      : `bash "${scriptPath}"`;
    const snippet = '"statusLine": { "type": "command", "command": ' + JSON.stringify(command) + ' }';
    output += '\n\nSTATUSLINE SETUP NEEDED: The bonsai plugin includes a statusline badge showing the ' +
      'active mode (e.g. [BONSAI], [BONSAI:ULTRA]). It is not configured yet. To enable, add this to ' +
      '~/.claude/settings.json: ' + snippet + ' Proactively offer to set this up on first interaction.';
  }
} catch (e) { /* don't block session start over statusline detection */ }

writeHookOutput('SessionStart', mode, output);
