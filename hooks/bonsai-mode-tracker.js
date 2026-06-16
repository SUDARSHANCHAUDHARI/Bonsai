#!/usr/bin/env node
// bonsai — UserPromptSubmit hook. Watches for /bonsai level switches and the
// "stop bonsai" / "normal mode" off-switch, and persists the chosen mode.

const { getDefaultMode } = require('./bonsai-config');
const { clearMode, setMode, writeHookOutput } = require('./bonsai-runtime');

let input = '';
process.stdin.on('data', (chunk) => { input += chunk; });
process.stdin.on('end', () => {
  try {
    // Strip a UTF-8 BOM some shells prepend when piping (breaks JSON.parse)
    const data = JSON.parse(input.replace(/^﻿/, ''));
    const prompt = (data.prompt || '').trim().toLowerCase();

    if (/^[/@$]bonsai\b/.test(prompt)) {
      const parts = prompt.split(/\s+/);
      const cmd = parts[0].replace(/^[@$]/, '/');
      const arg = parts[1] || '';

      // Only the level command touches mode. /bonsai-review etc. are skills.
      if (cmd === '/bonsai' || cmd === '/bonsai:bonsai') {
        let mode = null;
        if (['lite', 'full', 'ultra', 'off'].includes(arg)) mode = arg;
        else mode = getDefaultMode();

        if (mode === 'off') {
          clearMode();
          writeHookOutput('UserPromptSubmit', 'off', 'BONSAI MODE OFF');
        } else {
          setMode(mode);
          writeHookOutput('UserPromptSubmit', mode, 'BONSAI MODE CHANGED — level: ' + mode);
        }
        return;
      }
    }

    if (/\b(stop bonsai|normal mode)\b/i.test(prompt)) {
      clearMode();
      writeHookOutput('UserPromptSubmit', 'off', 'BONSAI MODE OFF');
    }
  } catch (e) {
    // Silent fail — never block a prompt over mode tracking
  }
});
