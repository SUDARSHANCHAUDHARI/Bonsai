# Benchmark

Two arms (no skill, bonsai), the everyday tasks from `promptfooconfig.yaml`.
Code LOC is counted from fenced code blocks by `loc.js`; tokens, cost, and
latency come from the API via promptfoo.

> No published median results yet — that lands in a later release (see the
> roadmap in the root README). The harness below is real and runnable today.

## Run

Requires an Anthropic API key and Node.js ≥ 22 (promptfoo's engine constraint):

```bash
cp ../.env.example ../.env      # add your ANTHROPIC_API_KEY
npx promptfoo@latest eval -c promptfooconfig.yaml --env-file ../.env --repeat 10
npx promptfoo@latest view
```

The bonsai arm (`arms/bonsai.js`) prepends the canonical ruleset straight from
`AGENTS.md`, so the benchmark always tests the same rules the plugin ships.

## Honesty note

`loc.js` only measures size — a short but broken answer still scores well on
LOC. A correctness gate (execute the email/debounce/CSV outputs, structural
checks for React/FastAPI) is on the roadmap before any numbers are published.
