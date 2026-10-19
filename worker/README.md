# Portfolio chat Worker

The backend for the "Ask about Yash" widget. It exists because **the portfolio is a static site**:
`vite build` inlines every `VITE_` variable into the JS bundle, so an API key in the frontend is
public to anyone who opens DevTools. This Worker holds the key, owns the system prompt, and checks
the calling origin.

## Deploy

```bash
cd worker
npx wrangler login
npx wrangler secret put ANTHROPIC_API_KEY     # paste the key when prompted; never goes in a file
npx wrangler deploy
```

`wrangler deploy` prints a URL like `https://yash-portfolio-chat.<subdomain>.workers.dev`.
Put it in the site's `.env` as `VITE_CHAT_API=...`, and add the same value as a repository
**variable** (not secret — it is not one) named `VITE_CHAT_API` so the GitHub Actions build picks
it up: *Settings → Secrets and variables → Actions → Variables*.

Then add this step to `.github/workflows/deploy.yml` before the build:

```yaml
      - name: Write .env
        run: echo "VITE_CHAT_API=${{ vars.VITE_CHAT_API }}" > .env
```

## Cost and abuse

Anthropic charges per token and this endpoint is on the public internet. The protections in
`src/index.js` are: an origin allow-list checked **before** the API call, a 24-turn conversation
cap, a 1,500-character message cap, and `max_tokens: 700`.

That is enough for normal traffic. It is **not** a hard spend limit. Before sharing the site
widely, do both of these:

1. **Set a budget alert** in the Anthropic console. This is the real backstop.
2. **Turn on the per-IP cap** — create the KV namespace and uncomment the binding in
   `wrangler.toml`:
   ```bash
   npx wrangler kv namespace create RATE
   ```
   The Worker uses it automatically when present (40 messages per IP per hour) and skips it when
   absent, so deploying without it works and adding it later needs no code change.

## Changing what it says

`src/profile.js` is the fact base and the **only** thing the assistant may state. Every line is
transcribed from `RESUME_CONTENT.md` in the job-application-pipeline repo, which is the provenance
ledger for every claim.

⛔ Do not add a fact here to make an answer sound stronger. A recruiter who probes an invented
claim in an interview finds a candidate who overstated, which is worse than the gap it covered.
The same banned claims apply as on the resume: no uptime/latency/throughput figures, no "sole
developer", no MCP (LISA's tools are *registered*), and no testing/CI-CD/Docker/microservices on
the Eisai entry.

The persona and the rules live in `SYSTEM` in `src/index.js`, server-side, so a visitor cannot edit
them from the browser.
