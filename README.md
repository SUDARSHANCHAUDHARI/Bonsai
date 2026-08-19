<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="assets/logo-dark.png">
    <img src="assets/logo.png" width="300" alt="Bonsai">
  </picture>
</p>

<h1 align="center">Bonsai</h1>

<p align="center"><em>Every cut deliberate. Nothing grown that need not grow.</em></p>

<p align="center">
  <img src="https://img.shields.io/badge/Claude%20Code-plugin-111111?style=flat-square" alt="Claude Code">
  <img src="https://img.shields.io/badge/Codex-plugin-111111?style=flat-square" alt="Codex">
  <img src="https://img.shields.io/badge/works%20with-10%20agents-111111?style=flat-square" alt="10 agents">
  <img src="https://img.shields.io/badge/license-MIT-111111?style=flat-square" alt="MIT">
</p>

---

A bonsai is not a small tree because it was starved. It is small because every
cut was deliberate. Bonsai puts that instinct inside your AI agent: it questions
whether the code needs to exist at all, reaches for the standard library before
custom code and native platform features before dependencies, and prefers one
line to fifty.

The best code is the code you never grew.

## How it works

Before writing code, the agent stops at the first cut that holds:

```
1. Does this need to exist?   → no: skip it (YAGNI)
2. Stdlib does it?            → use it
3. Native platform feature?   → use it
4. Installed dependency?      → use it
5. One line?                  → one line
6. Only then: the minimum that works
```

Small, not negligent: trust-boundary validation, data-loss handling, security,
and accessibility are never on the chopping block. Every deliberate shortcut is
marked with a `bonsai:` comment naming its ceiling and regrow path, so
`/bonsai-debt` can later harvest them into a ledger and "later" doesn't become
"never".

## Installation

The Claude Code and Codex plugins run two tiny Node.js lifecycle hooks, so
`node` needs to be on your PATH. If it isn't, the skills still work — the
always-on activation just stays quiet instead of erroring.

### Claude Code

```
/plugin marketplace add SUDARSHANCHAUDHARI/Bonsai
/plugin install bonsai@bonsai
```

Then open `/hooks`, trust the two lifecycle hooks, and start a new thread.
Add the statusline badge when prompted on first run.

### Codex

Install the plugin from this repo; it reuses the same `skills/` and
`hooks/hooks.json`. Restart Codex to pick it up.

### OpenCode

Run OpenCode from a checkout of this repo and add to `opencode.json`:

```json
{ "plugin": ["./.opencode/plugins/bonsai.mjs"] }
```

It injects the ruleset every turn at the active level and adds the `/bonsai`
commands. OpenCode also auto-loads `AGENTS.md`, so the rules hold even without
the plugin; the plugin adds the `lite/full/ultra/off` switches.

### pi

```bash
pi install git:github.com/SUDARSHANCHAUDHARI/Bonsai
```

The package extension injects the ruleset each turn and registers the `/bonsai`
commands; the `skills/` ship too.

### Gemini CLI

```bash
gemini extensions install https://github.com/SUDARSHANCHAUDHARI/Bonsai
```

Loads `AGENTS.md` as always-on context and registers the `/bonsai` commands.

### Instruction-only agents

Cursor, Windsurf, Cline, GitHub Copilot, and Kiro load the always-on ruleset
(no `/bonsai` levels or hooks) — copy the matching file:

| Agent | File |
|-------|------|
| Cursor | [`.cursor/rules/bonsai.mdc`](.cursor/rules/bonsai.mdc) |
| Windsurf | [`.windsurf/rules/bonsai.md`](.windsurf/rules/bonsai.md) |
| Cline | [`.clinerules/bonsai.md`](.clinerules/bonsai.md) |
| GitHub Copilot | [`.github/copilot-instructions.md`](.github/copilot-instructions.md) |
| Kiro | [`.kiro/steering/bonsai.md`](.kiro/steering/bonsai.md) |
| Generic | [`AGENTS.md`](AGENTS.md) |

Mapping details: [docs/agent-portability.md](docs/agent-portability.md).

## Commands

| Command | What it does |
|---------|--------------|
| `/bonsai [lite \| full \| ultra \| off]` | Set the intensity, or turn it off. No argument reports the current level. |
| `/bonsai-review` | Review the current diff for over-engineering; hands back a delete-list. |
| `/bonsai-audit` | Same lens across the whole repo, not just the diff. |
| `/bonsai-debt` | Harvest the `bonsai:` shortcuts you've deferred into a ledger. |
| `/bonsai-help` | Quick reference for the commands above. |

## Levels

| Level | Behavior |
|-------|----------|
| `lite` | Build what's asked, but name the smaller alternative. You pick. |
| `full` | The cut order enforced. Shortest diff. **Default.** |
| `ultra` | YAGNI extremist — ship the one-liner and challenge the requirement itself. |

Set the default for every new session with `BONSAI_DEFAULT_MODE`
(`lite`/`full`/`ultra`/`off`), or a `defaultMode` field in
`~/.config/bonsai/config.json` (`%APPDATA%\bonsai\config.json` on Windows).
Default is `full`.

## Roadmap

Shipped: Claude Code + Codex + OpenCode + pi + Gemini plugins, five
instruction-only adapters, five skills/commands, statusline badge, a benchmark
harness with a runnable **correctness gate** (so a short-but-broken answer can't
win on size), and `/bonsai-debt save` to write the ledger to `BONSAI-DEBT.md`.

Coming next:

- **Published benchmark numbers** — median LOC / cost / latency across models. Harness + gate are in [`benchmarks/`](benchmarks/) today; numbers need a real (paid) eval run, recorded in [`benchmarks/results/`](benchmarks/results/).
- **Statusline auto-setup** — offer to write the `statusLine` config on first run instead of only nudging.

## Development

```bash
npm test                          # rule-copy sync check + unit tests
node scripts/check-rule-copies.js # adapters still match AGENTS.md?
```

When you change the canonical compact ruleset, edit the block in `AGENTS.md`
(between the `BONSAI:BEGIN`/`END` markers) and recopy it into the adapter files;
`check-rule-copies.js` fails if they drift.

## Credit

Concept inspired by [ponytail](https://github.com/DietrichGebert/ponytail) (MIT)
and the "lazy senior dev" pattern. This is an independent, reworked take —
different persona, code, and rule text.

## License

[MIT](LICENSE).

---

## About

I'm Sudarshan Chaudhari, a Senior Quality Engineer, Test Automation specialist, and AI systems builder based in Bangkok, Thailand.

I have 13+ years of experience in software quality engineering, working across SaaS, fintech, gaming, web, mobile, cloud, and digital signage platforms. My background combines hands-on test automation with QA leadership, test strategy, CI/CD, release quality, production investigation, and cross-platform validation.

Alongside my professional QA career, I run [SudarshanTechLabs](https://sudarshantechlabs.com/), my independent engineering and product lab where I design, build, test, and ship software across Android, web, AI, cybersecurity, developer tooling, and cross-platform applications.

### What I work on

- ⚙️ **Quality Engineering & Test Automation** — Playwright, Selenium, Cypress, Appium, API testing, automation frameworks, end-to-end testing, CI/CD, release gates, GitHub Actions, risk-based testing, and production validation
- 🤖 **AI Systems & Automation** — AI agents, multi-agent orchestration, MCP servers, AI-assisted QA, prompt tooling, developer workflows, automation systems, and Claude Code plugins
- 📱 **Mobile & Cross-Platform Applications** — Android applications built with Kotlin and Jetpack Compose, Google Play releases, automated build and publishing pipelines, and cross-platform development spanning iOS, web, Windows, and macOS
- 🌐 **Web Applications & Platforms** — Full-stack applications using Next.js, TypeScript, Firebase, Cloudflare, REST APIs, and modern web infrastructure
- 🛠️ **Developer Tooling & CLI Engineering** — Rust, Python, TypeScript, CLI utilities, multi-repository tooling, build automation, release tooling, and engineering productivity systems
- 🛡️ **Cybersecurity & Observability** — Threat detection, log analysis, security auditing, vulnerability assessment, monitoring, and security-focused developer tools
- 📺 **Digital Signage & Device Platforms** — Content validation, playback testing, device compatibility, production investigation, monitoring, and QA across diverse hardware and operating-system environments

My work sits at the intersection of quality engineering, automation, AI, and software development. I approach products with a QA mindset from the beginning: understanding failure modes, designing for testability, automating repetitive work, and building release confidence into the engineering process.

Through SudarshanTechLabs, I also build products and tools from idea to production, covering architecture, development, testing, CI/CD, release automation, monitoring, and ongoing maintenance.

🌐 [sudarshantechlabs.com](https://sudarshantechlabs.com/) · 💼 [LinkedIn](https://linkedin.com/in/sudarshan-chaudhari) · 🐙 [GitHub](https://github.com/SUDARSHANCHAUDHARI) · ✉️ [sunny.sudarshan@gmail.com](mailto:sunny.sudarshan@gmail.com)
