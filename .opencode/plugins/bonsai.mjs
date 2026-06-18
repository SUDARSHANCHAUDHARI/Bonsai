// bonsai — OpenCode plugin.
//
// Injects the bonsai ruleset into every chat's system prompt at the active
// intensity, and persists /bonsai mode switches. Reuses the shared instruction
// builder so Claude Code, Codex, pi, and OpenCode all read one source of truth.
//
// Add it to your opencode.json:
//   { "plugin": ["./.opencode/plugins/bonsai.mjs"] }

import { createRequire } from 'module';
import fs from 'fs';
import os from 'os';
import path from 'path';

// The shared instruction builder is CommonJS; bridge to it from this ES module.
const require = createRequire(import.meta.url);
const { getBonsaiInstructions } = require('../../hooks/bonsai-instructions');
const { getDefaultMode, normalizePersistedMode } = require('../../hooks/bonsai-config');

// OpenCode has no flag-file convention of its own; keep mode beside its config.
const statePath = path.join(
  process.env.XDG_CONFIG_HOME || path.join(os.homedir(), '.config'),
  'opencode',
  '.bonsai-active',
);

function readMode() {
  try {
    return normalizePersistedMode(fs.readFileSync(statePath, 'utf8').trim()) || getDefaultMode();
  } catch (e) {
    return getDefaultMode();
  }
}

function writeMode(mode) {
  fs.mkdirSync(path.dirname(statePath), { recursive: true });
  fs.writeFileSync(statePath, mode);
}

export default async ({ client } = {}) => {
  const log = (level, message) => {
    try { client && client.app && client.app.log({ body: { service: 'bonsai', level, message } }); } catch (e) {}
  };

  return {
    // Append the ruleset to the system prompt every turn.
    'experimental.chat.system.transform': async (_input, output) => {
      const mode = readMode();
      if (mode === 'off') return;
      output.system.push(getBonsaiInstructions(mode));
    },

    // Persist `/bonsai <level>` so the next turn's injection follows it.
    // bonsai: mode applies from the next message, not the current one — the
    // transform reads the flag the command writes. Switch to a synchronous
    // store if same-turn switching ever matters.
    'command.execute.before': async (input) => {
      if (!input || input.command !== 'bonsai') return;
      const mode = normalizePersistedMode((input.arguments || '').trim()) || getDefaultMode();
      writeMode(mode);
      log('info', 'bonsai ' + mode);
    },
  };
};
