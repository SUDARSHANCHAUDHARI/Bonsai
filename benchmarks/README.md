# Benchmark

Two arms (no skill, bonsai), the everyday tasks from `promptfooconfig.yaml`.
Each row is graded on two metrics:

- **`loc.js`** — lines of code from fenced blocks (measurement, always passes).
- **`correctness.js`** — a gate: it runs the generated code (email/debounce/CSV
  execute; React/FastAPI are structural) and fails the row if it's broken. So
  "fewer lines" can never be bought with a wrong answer.

Tokens, cost, and latency come from the API via promptfoo.

## Run

Requires an Anthropic API key, Node.js ≥ 22 (promptfoo's engine constraint), and
`python3` on PATH for the email/CSV checks:

```bash
cp ../.env.example ../.env      # add your ANTHROPIC_API_KEY
npx promptfoo@latest eval -c promptfooconfig.yaml --env-file ../.env --repeat 10
npx promptfoo@latest view
```

The bonsai arm (`arms/bonsai.js`) prepends the canonical ruleset straight from
`AGENTS.md`, so the benchmark always tests the rules the plugin ships.

## Publishing numbers

After a run, record the medians in `results/` using `results/TEMPLATE.md`. There
are **no published numbers yet** — they need a real (paid) eval against the API,
so this repo ships the harness, not invented figures. Run it yourself and the
results are reproducible from this config.

## Verifying the gate without an API key

The gate itself is unit-tested on known-good and known-broken snippets — no key
needed:

```bash
node --test correctness.test.js
```

That proves a working email validator passes and a `return True` validator
fails, etc., so the gate is trustworthy before you spend a cent on the model run.
