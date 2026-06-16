// Host-specific glue: where the state flag lives and how hook output is shaped.
// Two hosts: Claude Code (plain stdout context) and Codex (JSON envelope).

const fs = require('fs');
const path = require('path');
const { getClaudeDir } = require('./bonsai-config');

const STATE_FILE = '.bonsai-active';
const isCodex = Boolean(process.env.PLUGIN_DATA);

const stateDir = isCodex ? process.env.PLUGIN_DATA : getClaudeDir();
const statePath = path.join(stateDir, STATE_FILE);

function setMode(mode) {
  fs.mkdirSync(path.dirname(statePath), { recursive: true });
  fs.writeFileSync(statePath, mode);
}

function clearMode() {
  try { fs.unlinkSync(statePath); } catch (e) {}
}

function writeHookOutput(event, mode, context = '') {
  if (isCodex) {
    const output = { systemMessage: `BONSAI:${mode.toUpperCase()}` };
    if (context) {
      output.hookSpecificOutput = { hookEventName: event, additionalContext: context };
    }
    process.stdout.write(JSON.stringify(output));
    return;
  }
  // Claude Code: stdout from a SessionStart/UserPromptSubmit hook becomes context.
  process.stdout.write(context);
}

module.exports = { clearMode, isCodex, setMode, statePath, writeHookOutput };
