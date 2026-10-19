# Portfolio chat Worker

Backend for the "Ask about Yash" widget. **No API key. No card. Nothing to spend.**

Inference runs on [Cloudflare Workers AI](https://developers.cloudflare.com/workers-ai/) through
the `AI` binding, which is included in the Workers **free** plan — 10,000 Neurons/day, reset at
00:00 UTC. There is no billing account attached, so it cannot quietly start charging: when the
daily allocation is gone the call fails and the widget tells the visitor to email instead.

> ⚠️ Confirm the current free allocation on
> [Cloudflare's pricing page](https://developers.cloudflare.com/workers-ai/platform/pricing/).
> The figure above came from third-party trackers, not Cloudflare's own docs.

## Why a Worker at all, if it is free either way

The portfolio is a static Vite build on GitHub Pages. `vite build` **inlines every `VITE_`
variable into the bundle**, so the frontend cannot hold a credential, and a browser cannot be
trusted to own the system prompt either — a visitor could edit the persona or the fact base. The
Worker owns both, and checks the calling origin before it does any work.

## Why not run the model in the visitor's browser

WebLLM/WebGPU is genuinely free and a nice demo, but it is the wrong trade for this page:

- it downloads **300MB–1GB of weights to the visitor's machine** before the first answer, and a
  recruiter gives a portfolio about ninety seconds
- it needs **WebGPU**, which a meaningful share of visitors do not have, worst on mobile
- the **~1B models** that fit in a browser are the ones most likely to invent a fact about him,
  on a page whose entire job is an accurate first impression

Workers AI costs the same (nothing), downloads nothing, and answers immediately. If the
"runs entirely on your device" angle is worth showing off later, the honest way to do it is an
opt-in toggle behind a click, not the default path.

## Deploy

```bash
cd worker
npx wrangler login
npx wrangler deploy
```

That is the whole thing — no `secret put` step, because there is no secret.

`wrangler deploy` prints a URL like `https://yash-portfolio-chat.<subdomain>.workers.dev`. Put it
in `.env` as `VITE_CHAT_API=...`, and add the same value as a repository **variable** (not a
secret — it is not one) named `VITE_CHAT_API` under *Settings → Secrets and variables → Actions →
Variables*. Then add this step to `.github/workflows/deploy.yml` before the build:

```yaml
      - name: Write .env
        run: echo "VITE_CHAT_API=${{ vars.VITE_CHAT_API }}" > .env
```

## Limits and abuse

The endpoint is public. Protections in `src/index.js`: an origin allow-list checked **before**
inference, a 24-turn conversation cap, a 1,500-character message cap, and `max_tokens: 600`.

On the free plan the worst case is that someone burns the day's Neurons and the widget degrades to
"email him instead" until 00:00 UTC. To make that harder, turn on the per-IP cap:

```bash
npx wrangler kv namespace create RATE
```

then uncomment the `kv_namespaces` block in `wrangler.toml`. The Worker uses it automatically when
the binding exists (40 messages per IP per hour) and skips it when it does not, so this needs no
code change.

## Changing the model

`MODEL` in `src/index.js`. Any chat model from the
[Workers AI catalog](https://developers.cloudflare.com/workers-ai/models/) works; they consume
Neurons at different rates, so a smaller one stretches the day further. The response parser reads
both shapes Workers AI returns (`choices[0].message.content` and `response`), so swapping the
model cannot silently return nothing.

## Changing what it says

`src/profile.js` is the fact base and the **only** thing the assistant may state. Every line is
transcribed from `RESUME_CONTENT.md` in the job-application-pipeline repo, which is the provenance
ledger for every claim he makes.

⛔ Do not add a fact here to make an answer sound stronger. A recruiter who probes an invented
claim in an interview finds a candidate who overstated, which is worse than the gap it covered.
The resume's bans apply here too: no uptime/latency/throughput figures, no "sole developer", no
MCP (LISA's tools are *registered*), and no testing/CI-CD/Docker/microservices on the Eisai entry.
