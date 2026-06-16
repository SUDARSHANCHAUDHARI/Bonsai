#!/usr/bin/env bash
# Prints the bonsai statusline badge from the mode flag file.
state="${CLAUDE_CONFIG_DIR:-$HOME/.claude}/.bonsai-active"
[ -f "$state" ] || exit 0
mode=$(tr -d '[:space:]' < "$state")
[ -z "$mode" ] && exit 0
if [ "$mode" = "full" ]; then
  printf '[BONSAI]'
else
  printf '[BONSAI:%s]' "$(printf '%s' "$mode" | tr '[:lower:]' '[:upper:]')"
fi
