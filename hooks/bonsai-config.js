// Shared config for bonsai hooks: where state lives and what the default mode is.

const fs = require('fs');
const os = require('os');
const path = require('path');

const DEFAULT_MODE = 'full';
const MODES = ['lite', 'full', 'ultra'];

function getClaudeDir() {
  return process.env.CLAUDE_CONFIG_DIR || path.join(os.homedir(), '.claude');
}

function getConfigPath() {
  if (process.platform === 'win32' && process.env.APPDATA) {
    return path.join(process.env.APPDATA, 'bonsai', 'config.json');
  }
  const base = process.env.XDG_CONFIG_HOME || path.join(os.homedir(), '.config');
  return path.join(base, 'bonsai', 'config.json');
}

// lite/full/ultra -> itself; anything else -> null
function normalizeMode(mode) {
  const m = String(mode || '').trim().toLowerCase();
  return MODES.includes(m) ? m : null;
}

// like normalizeMode but also passes through 'off' (a real persisted state)
function normalizePersistedMode(mode) {
  const m = String(mode || '').trim().toLowerCase();
  if (m === 'off') return 'off';
  return normalizeMode(m);
}

function getDefaultMode() {
  const fromEnv = normalizePersistedMode(process.env.BONSAI_DEFAULT_MODE);
  if (fromEnv) return fromEnv;
  try {
    const cfg = JSON.parse(fs.readFileSync(getConfigPath(), 'utf8'));
    const fromFile = normalizePersistedMode(cfg.defaultMode);
    if (fromFile) return fromFile;
  } catch (e) {
    // no config file is fine
  }
  return DEFAULT_MODE;
}

module.exports = {
  DEFAULT_MODE,
  MODES,
  getClaudeDir,
  getConfigPath,
  getDefaultMode,
  normalizeMode,
  normalizePersistedMode,
};
