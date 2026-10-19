# yashdeep94.github.io

My portfolio. React + Vite, deployed to GitHub Pages, with an AI assistant that answers questions
about my background.

**Live:** [yashdeep94.github.io](https://yashdeep94.github.io)

---

## The chat assistant

The interesting part of this repo. A visitor can open a chat widget and ask what I have built,
how I work, or whether I fit a role they are hiring for. It answers from a fact base I maintain by
hand, streams its reply, and is clearly labelled as an AI rather than as me.

### Why there is a `worker/` directory

This site is a static build. `vite build` **inlines every `VITE_` variable into the bundle**, so the
frontend cannot hold a credential, and it cannot own the system prompt either since a visitor could
edit it from the console. Both live in a small serverless function, which also checks the calling
origin and rate-limits per IP before it does any work. The frontend only ever knows its URL.

### Grounding, and why it is the point

An assistant that speaks for a candidate has one failure mode that matters: saying something
flattering that is not true. A recruiter who probes an invented claim in an interview finds someone
who overstated, which is worse than whatever gap the claim was covering.

So it may only state facts from `worker/src/profile.js`, it is told to say "I don't have that
detail" and hand over my email rather than guess, and it carries an explicit list of claims it must
not make even when the facts look like they support them, plus a list of tools I have **not** used
so it answers "no" instead of bridging. Skills are split into what I have shipped in production
versus what is coursework, because an undifferentiated keyword list inside a prompt that asks a
model to advocate is an invention generator.

`worker/test-prompt.mjs` asserts those rules actually reach the model and fails the deploy if they
do not. It exists because they once did not: the ban list was written as `//` comments above the
template literal instead of inside it, so no model ever read a word of it while the file looked,
to a human, like the rule was enforced. **A rule written in the wrong place is not a rule.**

It also gates individual facts. Three separate times a fact was lost while trimming the prompt for
length, and each time the model filled the hole with something plausible and wrong. Prose is
trimmable; facts are not.

### An on-device mode that was built and removed

An earlier version ran [WebLLM](https://github.com/mlc-ai/web-llm) in the visitor's own browser
over WebGPU, as a second mode. It is deleted. A 1B model is what fits in a browser tab, and in
testing it misstated facts and then reproduced its entire system prompt verbatim as an answer. A
visibly broken showcase is worse than no showcase. Kept here as a note because the evaluation was
the useful part.

## Running it

```bash
npm install
npm run dev
```

The chat widget renders only when `VITE_CHAT_API` is set (see `.env.example`); without it the rest
of the site works normally. On-device mode needs no Worker at all, so with WebGPU you can use the
widget locally with nothing deployed.

### Deploying the Worker

```bash
cd worker
npx wrangler login      # free Cloudflare account, no card
npx wrangler deploy
node ../worker/test-prompt.mjs   # run before every deploy
```

See [`worker/README.md`](worker/README.md) for the model catalog, the free-tier limits, and how to
turn on the per-IP rate cap.

### Deploying the site

Pushing to `main` triggers `.github/workflows/deploy.yml`, which builds and publishes `dist/` to
the `gh-pages` branch.

---

## Stack

React 18 · Vite 6 · Tailwind 4 · React Router · lucide-react · a serverless edge function ·
GitHub Actions

## Structure

```
src/
  components/   Hero, Navbar, Technologies, Footer, AskYash (the chat widget)
  pages/        Home, Apps
  data/         site content
  contexts/     theme
worker/         the serverless function: system prompt, fact base, serving logic, prompt test
```
