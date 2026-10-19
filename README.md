# yashdeep94.github.io

My portfolio. React + Vite, deployed to GitHub Pages, with an AI assistant that answers questions
about my background.

**Live:** [yashdeep94.github.io](https://yashdeep94.github.io)

---

## The chat assistant

The interesting part of this repo. A visitor can open a chat widget and ask what I have built,
how I work, or whether I fit a role they are hiring for. It answers in my voice, from a fact base
I maintain by hand, and it is clearly labelled as an AI rather than as me.

It runs in two modes, switchable from the widget:

| | Cloud | On device |
|---|---|---|
| Where it runs | Cloudflare Workers AI | The visitor's own browser |
| Model | `gemma-4-26b-a4b-it` | `Llama-3.2-1B-Instruct-q4f16` via [WebLLM](https://github.com/mlc-ai/web-llm) |
| First answer | Immediate | After a one-time ~880MB weight download |
| Needs | Nothing | WebGPU |
| Data leaves the browser | The question does | Nothing at all |

Cloud is the default because the cost of on-device is the visitor's, not mine, and a progress bar
is a bad first impression. On device exists because "this model is running entirely in your
browser" is a real thing to show, and because it is an honest answer for anyone who would rather
their questions did not leave their machine.

### Why there is a `worker/` directory

This site is a static build. `vite build` **inlines every `VITE_` variable into the JS bundle**,
so the frontend cannot hold a credential, and it cannot own the system prompt either since a
visitor could edit it from the console. Both live in a Cloudflare Worker, which also checks the
calling origin before it does any work. The frontend only ever knows the Worker's URL.

Inference is on the Workers AI free allocation, so the whole thing costs nothing to run.

### Grounding, and why it is the point

An assistant that speaks for a candidate has one failure mode that matters: saying something
flattering that is not true. A recruiter who probes an invented claim in an interview finds
someone who overstated, which is worse than whatever gap the claim was covering.

So the assistant may only state facts from `worker/src/profile.js`, it is instructed to say "I
don't have that detail" and hand over my email rather than guess, and it carries an explicit list
of claims it must not make even when the facts look like they support them. The skills section is
split into what I have shipped in production versus what is coursework, because an undifferentiated
keyword list inside a prompt that asks the model to advocate is an invention generator.

`worker/test-prompt.mjs` asserts that those rules actually reach the model, and fails the deploy
if they do not. That test exists because they once did not: the ban list was written as `//`
comments above the template literal instead of inside it, so no model ever read a word of it while
the file looked, to a human, like the rule was enforced. A rule written in the wrong place is not
a rule.

---

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

React 18 · Vite 6 · Tailwind 4 · React Router · lucide-react · Cloudflare Workers · Workers AI ·
WebLLM · GitHub Actions

## Structure

```
src/
  components/   Hero, Navbar, Technologies, Footer, AskYash (the chat widget)
  pages/        Home, Apps
  data/         site content, and the condensed fact base for on-device mode
  contexts/     theme
worker/         the Cloudflare Worker: system prompt, fact base, serving logic, prompt test
```
