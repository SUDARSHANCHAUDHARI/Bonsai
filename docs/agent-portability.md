# Agent Portability

Bonsai is one behavior shipped to many agents. The skills in `skills/` hold the
core behavior; everything else is a thin adapter that loads it into a given host.

## Supported adapters

| Host | Files | Tier |
|------|-------|------|
| Claude Code | `.claude-plugin/`, `commands/`, `hooks/` | Full: session activation, mode tracking, commands, statusline. |
| Codex | `.codex-plugin/plugin.json`, `hooks/hooks.json`, `hooks/`, `skills/` | Full: same skills + lifecycle hooks for activation and mode tracking. |
| OpenCode | `.opencode/plugins/bonsai.mjs`, `.opencode/command/`, `hooks/`, `skills/` | Full: server plugin injects the ruleset each turn via `experimental.chat.system.transform` and persists `/bonsai` switches; reuses the shared instruction builder. |
| pi | `pi-extension/`, `skills/`, `hooks/` | Full: package extension injects the ruleset each turn through the shared builder and registers the `/bonsai` commands. |
| Gemini CLI | `gemini-extension.json`, `AGENTS.md`, `commands/`, `skills/` | Always-on context via `contextFileName: AGENTS.md`; reuses `commands/*.toml` + `skills/`. |
| Cursor | `.cursor/rules/bonsai.mdc` | Instruction-only: always-on project rule. |
| Windsurf | `.windsurf/rules/bonsai.md` | Instruction-only. |
| Cline | `.clinerules/bonsai.md` | Instruction-only. |
| GitHub Copilot | `.github/copilot-instructions.md` | Instruction-only. |
| Kiro | `.kiro/steering/bonsai.md` | Instruction-only steering rule. |
| Generic agents | `AGENTS.md` or `skills/*/SKILL.md` | Copy the compact rule file or load the skills directly. |

Instruction-only adapters get the always-on ruleset but no `/bonsai` level
switches or hooks.

## Adapter rule

Keep adapters thin. Where a host supports skills or hooks, point it at the
existing `skills/` and `hooks/`. Where it only supports project instructions,
copy the canonical compact block from `AGENTS.md` verbatim and keep it in sync:

```bash
node scripts/check-rule-copies.js
```

The canonical block lives between `<!-- BONSAI:BEGIN -->` and
`<!-- BONSAI:END -->` in `AGENTS.md`. The check fails if any adapter drifts.

## Portable behavior

- `skills/bonsai/SKILL.md` — bonsai mode (the cut order)
- `skills/bonsai-review/SKILL.md` — over-engineering review of a diff
- `skills/bonsai-audit/SKILL.md` — whole-repo over-engineering audit
- `skills/bonsai-debt/SKILL.md` — harvest `bonsai:` shortcuts into a ledger
- `skills/bonsai-help/SKILL.md` — quick reference
- `AGENTS.md` — compact always-on ruleset for hosts without skill support
