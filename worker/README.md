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

## The two modes

The widget has a **Cloud / On device** toggle.

**Cloud** (default) runs here, on Workers AI. Fast, no download, the stronger model.

**On device** runs `Llama-3.2-1B-Instruct-q4f16_1` in the visitor's own browser through
[WebLLM](https://github.com/mlc-ai/web-llm) over WebGPU. Nothing is sent anywhere — the
conversation never leaves their machine. The cost is theirs, not his:

- a **one-time ~880MB** weight download before the first answer, cached by their browser
- **WebGPU required**; the toggle is disabled with an explanatory tooltip when absent
- a **1B model**, so answers are shorter and less precise than Cloud

That is why Cloud is the default and On device is opt-in: a recruiter gives a portfolio about
ninety seconds, and a progress bar spends all of it. On device is there because "this model is
running entirely in your browser" is itself worth showing an AI-focused hiring manager, and
because it is a genuine privacy answer for anyone who would rather not have their questions
leave their machine.

### Where the on-device model is stored, and how to remove it

WebLLM writes the weights into the browser's **Cache Storage**, under `webllm/model`,
`webllm/wasm` and `webllm/config`. They persist across reloads and survive closing the tab. They
are per origin, so a download on this site is not shared with any other.

The widget shows a line saying how much is stored with a **Remove them** control, whenever the
cache exists. To check or clear it by hand instead:

- **DevTools** (any Chromium browser or Safari): Application tab, Cache Storage in the sidebar.
  The three `webllm/*` entries are it. Right click, Delete.
- **Console, any origin that loaded it:**
  ```js
  await caches.keys()                      // look for webllm/model
  await caches.delete('webllm/model')      // and webllm/wasm, webllm/config
  await navigator.storage.estimate()       // bytes this origin is using
  ```
- **Browser settings:** Chrome, Settings, Privacy, Third-party cookies, See all site data, then
  find the site and Delete. Safari, Settings, Advanced, Website Data.

⚠️ Clearing site data for the origin also clears it. Nothing is written outside the browser: there
is no file on disk to find, and nothing is sent anywhere.

The two fact bases do **not** share content. `worker/src/profile.js` is the full one; on-device uses the
condensed `src/data/localProfile.js`, because 1B models have a 4,096-token context window and the
full profile would crowd out the conversation. Switching modes clears the transcript for that
reason, rather than carrying one model's history into a window that cannot hold it.

## Deploy

```bash
cd worker
npx wrangler login
npx wrangler deploy
```

That is the whole thing — no `secret put` step, because there is no secret.

`wrangler deploy` prints a URL like `https://yash-portfolio-chat.<subdomain>.workers.dev`.

That URL is the **built-in default** in `src/components/AskYash.jsx`, so the site needs no build
configuration and no repository variable. `.env` only overrides it for local work (see
`.env.example`).

⚠️ It used to be a required `VITE_CHAT_API` build variable, and the GitHub Actions workflow never
set it, so production shipped with the Cloud option missing entirely and only on-device mode
offered. Nothing errored. If you move the Worker, change the default in that file.

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
