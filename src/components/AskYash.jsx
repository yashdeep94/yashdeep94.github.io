import { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, X, Bot, Cloud, Cpu } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { LOCAL_SYSTEM, LOCAL_MODEL, LOCAL_MODEL_MB } from '../data/localProfile';

// ⚠️ The on-device model has a 4,096-token window and the system prompt takes ~1,300 of it.
//    Left unbounded, a long conversation silently overflows and the model starts answering from
//    a window that no longer contains the facts, confidently and wrongly. Keep the last N turns.
//    Cloud has no such limit; the Worker enforces its own.
const LOCAL_MAX_TURNS = 7;   // 7 not 8: at 8 the window had 88 tokens spare, and both the
                             // chars-per-token and tokens-per-turn figures are estimates.

// 🚨 The endpoint is a Cloudflare Worker, not this app. A static build cannot hold a credential:
//    `vite build` INLINES every VITE_ variable into the bundle. The Worker owns the system prompt
//    and checks the calling origin; this URL is public by design and safe in the bundle.
//
// 🐛 THE DEFAULT IS NOT LAZINESS, IT IS THE FIX FOR A REAL OUTAGE. This read
//    `import.meta.env.VITE_CHAT_API || ''`, and the GitHub Actions workflow never set that
//    variable, so the production build shipped with API = '' and the Cloud option simply did not
//    render. The site went live offering ONLY on-device mode, which asks a recruiter for an 880MB
//    download before their first answer. Nothing errored; the feature just quietly halved itself.
//    A required build-time variable that only one deploy path sets is a trapdoor. The URL is not
//    a secret, so the deployed Worker is the default and .env only overrides it for local work.
const API =
  import.meta.env.VITE_CHAT_API || 'https://yash-portfolio-chat.yashdevdarekar94.workers.dev';

const ACCENT = '#6366f1';

// `dvh` tracks the DYNAMIC viewport: it shrinks when the iOS address bar is showing and when the
// keyboard opens, which is exactly the case `vh` gets wrong on a phone. Feature-detected because
// React inline styles cannot carry a CSS fallback value (an array is joined with a comma and
// emits invalid CSS).
const DVH =
  typeof CSS !== 'undefined' && CSS.supports && CSS.supports('height', '100dvh')
    ? '100dvh'
    : '100vh';

// WebGPU is the hard requirement for on-device mode and a meaningful share of visitors lack it,
// mobile worst of all. Detect rather than assume: a toggle that fails on click is worse than a
// toggle that is honestly disabled.
const hasWebGPU = typeof navigator !== 'undefined' && 'gpu' in navigator;

// 🚨 The engine is ~14MB of JS plus ~880MB of weights. It is dynamically imported on FIRST USE of
//    on-device mode, never at page load, so a recruiter who never touches the toggle pays nothing
//    for its existence. Vite code-splits it into its own chunk automatically.
// WebLLM stores weights in the browser's Cache Storage under these three names. Checking and
// clearing them uses the NATIVE caches API, so the widget can report and delete an 880MB download
// WITHOUT importing the 6MB engine just to ask a question about it.
// ⚠️ `caches` is secure-context only (https or localhost) and throws in some private modes, so
//    every call is guarded and the UI simply hides when it is unavailable.
const WEBLLM_CACHES = ['webllm/model', 'webllm/wasm', 'webllm/config'];

const modelCached = async () => {
  try {
    if (typeof caches === 'undefined') return false;
    const keys = await caches.keys();
    return keys.includes('webllm/model');
  } catch { return false; }
};

const clearModelCache = async () => {
  try {
    await Promise.all(WEBLLM_CACHES.map((k) => caches.delete(k)));
    return true;
  } catch { return false; }
};

let enginePromise = null;
const getEngine = async (onProgress) => {
  if (enginePromise) return enginePromise;
  enginePromise = (async () => {
    const webllm = await import('@mlc-ai/web-llm');
    return webllm.CreateMLCEngine(LOCAL_MODEL, { initProgressCallback: onProgress });
  })();
  try {
    return await enginePromise;
  } catch (err) {
    enginePromise = null;        // a failed load must not poison the next attempt
    throw err;
  }
};

// ⚠️ An opener must buy more than the resume already gives. "When can he start?" resolved to one
//    sentence a recruiter could read on the page, so it was spending a quarter of the first
//    impression on nothing.
const OPENERS = [
  'What has he actually built?',
  'Tell me about LISA',
  'Why him over other new grads?',
  'Is he a fit for a backend role?',
];


// ── Minimal markdown for chat answers. The models emit **bold**, numbered lists and bullets, and
//    the bubble rendered them as literal asterisks because it printed plain text.
//
// ⛔ NOT dangerouslySetInnerHTML, and no markdown library. This text comes from a model that a
//    visitor can steer, so it is untrusted input: injecting it as HTML is an XSS hole on a page
//    that carries his name. Everything below builds REACT ELEMENTS, so text can never become
//    markup, and only the four things the models actually produce are handled.
const inline = (text, keyBase) => {
  // **bold** and `code`, applied to plain text only.
  const out = [];
  const re = /(\*\*([^*]+)\*\*|`([^`]+)`)/g;
  let last = 0, m, i = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index));
    if (m[2] !== undefined) out.push(<strong key={`${keyBase}b${i++}`}>{m[2]}</strong>);
    else out.push(
      <code key={`${keyBase}c${i++}`} style={{
        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', fontSize: '0.86em',
        background: 'rgba(127,127,127,0.16)', padding: '1px 4px', borderRadius: 4,
      }}>{m[3]}</code>
    );
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
};

const Markdown = ({ text }) => {
  const blocks = [];
  let list = null;                     // {ordered, items[]}
  const flush = () => {
    if (!list) return;
    const Tag = list.ordered ? 'ol' : 'ul';
    blocks.push(
      <Tag key={`l${blocks.length}`} style={{ margin: '6px 0', paddingLeft: 20 }}>
        {list.items.map((it, i) => (
          <li key={i} style={{ marginBottom: 3 }}>{inline(it, `${blocks.length}-${i}`)}</li>
        ))}
      </Tag>
    );
    list = null;
  };
  for (const raw of String(text).split('\n')) {
    const line = raw.trimEnd();
    const ol = line.match(/^\s*\d+[.)]\s+(.*)$/);
    const ul = line.match(/^\s*[-*•]\s+(.*)$/);
    if (ol || ul) {
      const ordered = !!ol;
      if (!list || list.ordered !== ordered) { flush(); list = { ordered, items: [] }; }
      list.items.push((ol || ul)[1]);
      continue;
    }
    flush();
    if (!line.trim()) continue;
    blocks.push(
      <p key={`p${blocks.length}`} style={{ margin: '0 0 8px' }}>{inline(line, `p${blocks.length}`)}</p>
    );
  }
  flush();
  // Trailing margin on the last block would pad the bubble unevenly.
  return <div style={{ display: 'contents' }}>{blocks}</div>;
};

const Bubble = ({ role, text, dk, streaming }) => {
  const mine = role === 'user';
  return (
    <div style={{ display: 'flex', justifyContent: mine ? 'flex-end' : 'flex-start', marginBottom: 12 }}>
      <div
        style={{
          maxWidth: '85%',
          padding: '10px 14px',
          borderRadius: mine ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
          fontSize: '0.9rem',
          lineHeight: 1.55,
          overflowWrap: 'anywhere',
          background: mine ? ACCENT : dk ? 'rgba(255,255,255,0.06)' : 'rgba(15,23,42,0.05)',
          color: mine ? '#fff' : dk ? '#e5e7eb' : '#1f2937',
          border: mine ? 'none' : `1px solid ${dk ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.08)'}`,
        }}
      >
        {mine ? text : <Markdown text={text} />}
        {streaming && (
          <span aria-hidden="true" style={{
            display: 'inline-block', width: 7, height: 13, marginLeft: 2,
            background: 'currentColor', opacity: 0.55, verticalAlign: '-2px',
            animation: 'pulse 1s step-end infinite',
          }} />
        )}
      </div>
    </div>
  );
};

const AskYash = () => {
  const { theme } = useTheme();
  const dk = theme === 'dark';
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState([]);
  const [draft, setDraft] = useState('');
  const [busy, setBusy] = useState(false);
  const [mode, setMode] = useState(API ? 'cloud' : 'local');   // 'cloud' | 'local'
  const [load, setLoad] = useState(null);             // {pct, text} while weights download
  // 📱 On a phone the floating panel is the wrong shape: 100vh is unreliable on iOS Safari (the
  //    address bar collapses after load, so a vh-sized panel is taller than the visible area),
  //    and the on-screen keyboard covers a bottom-anchored box the moment the input is focused.
  //    Full screen below 480px solves both, and is what every chat app does on a phone.
  const [narrow, setNarrow] = useState(
    typeof window !== 'undefined' && window.matchMedia('(max-width: 480px)').matches
  );
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 480px)');
    const on = (e) => setNarrow(e.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);
  const engineRef = useRef(null);
  const [cached, setCached] = useState(false);
  const endRef = useRef(null);
  const inputRef = useRef(null);

  const scrollerRef = useRef(null);
  const anchorRef = useRef(null);      // the question the current answer belongs to
  const pinnedFor = useRef(-1);

  // ── SCROLL. ⛔ Do NOT follow the text as it streams. Yash, after using it: "it also scrolls
  //    down with text I want it to stay there as user needs to scroll back again to read it."
  //    Following the tail means the visitor only ever sees the last two lines being written and
  //    has to scroll back up to read the answer from its beginning, which is the opposite of
  //    helpful on a 1,300-character answer.
  //
  //    Instead: when a new question is sent, scroll THAT question to the top of the panel once,
  //    so the answer renders into the empty space below it and reads top-down like a page. Then
  //    leave the scroll position completely alone while tokens arrive.
  useEffect(() => {
    const lastUser = msgs.map((m, i) => (m.role === 'user' ? i : -1)).filter((i) => i >= 0).pop();
    if (lastUser === undefined || lastUser === pinnedFor.current) return;
    pinnedFor.current = lastUser;
    requestAnimationFrame(() => anchorRef.current?.scrollIntoView({ block: 'start', behavior: 'smooth' }));
  }, [msgs]);

  useEffect(() => { if (open) inputRef.current?.focus(); }, [open]);
  // Re-check on open and after a load, so the footer reflects reality rather than this session.
  useEffect(() => { if (open) modelCached().then(setCached); }, [open, load]);
  useEffect(() => {
    const esc = (e) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', esc);
    return () => window.removeEventListener('keydown', esc);
  }, []);

  const send = async (textArg) => {
    const text = (textArg ?? draft).trim();
    if (!text || busy) return;
    const next = [...msgs, { role: 'user', content: text }];
    setMsgs(next);
    setDraft('');
    setBusy(true);

    const fail = (why) => setMsgs([...next, { role: 'assistant', content: why }]);

    try {
      // Both modes append into the SAME assistant bubble as tokens arrive, so the two paths feel
      // identical to a visitor and the scroll does not jump when a finished answer lands whole.
      const push = (delta) =>
        setMsgs((cur) => {
          const copy = cur.slice();
          const last = copy[copy.length - 1];
          if (last && last.role === 'assistant' && last.streaming) {
            copy[copy.length - 1] = { ...last, content: last.content + delta };
          } else {
            copy.push({ role: 'assistant', content: delta, streaming: true });
          }
          return copy;
        });
      const settle = () =>
        setMsgs((cur) => cur.map((m, i) =>
          i === cur.length - 1 && m.streaming ? { ...m, streaming: false } : m));

      if (mode === 'local') {
        // ── ON DEVICE. Nothing leaves the browser; no request is made at all.
        const engine =
          engineRef.current ||
          (engineRef.current = await getEngine((p) => {
            const pct = Math.round((p.progress || 0) * 100);
            setLoad({ pct, text: p.text || 'Loading model' });
          }));
        setLoad(null);
        const stream = await engine.chat.completions.create({
          messages: [{ role: 'system', content: LOCAL_SYSTEM }, ...next.slice(-LOCAL_MAX_TURNS)],
          temperature: 0.3,
          max_tokens: 400,
          stream: true,
        });
        for await (const part of stream) {
          const delta = part?.choices?.[0]?.delta?.content;
          if (delta) push(delta);
        }
        settle();
      } else {
        // ── CLOUD. The Worker owns the prompt and the facts, and streams plain text back.
        const r = await fetch(API, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: next }),
        });
        // An error comes back as JSON, a good answer as a text stream. Branch on the type rather
        // than assuming, so a 429 or a 502 still renders its message instead of raw JSON.
        const ctype = r.headers.get('Content-Type') || '';
        if (!r.ok || ctype.includes('application/json')) {
          const data = await r.json().catch(() => ({}));
          setMsgs([...next, {
            role: 'assistant',
            content: data.reply || data.error || 'Something went wrong. Email Yash at yashdevdarekar94@gmail.com',
          }]);
        } else {
          const reader = r.body.getReader();
          const dec = new TextDecoder();
          for (;;) {
            const { done, value } = await reader.read();
            if (done) break;
            push(dec.decode(value, { stream: true }));
          }
          settle();
        }
      }
    } catch (err) {
      // ⛔ Say what to do next. A dead chat widget on a portfolio is worse than no widget, so the
      //    failure path always hands the recruiter a working way to reach him.
      setLoad(null);
      console.error(err);
      fail(
        mode === 'local'
          ? "The on-device model couldn't start on this machine. Switch back to Cloud above, or email Yash at yashdevdarekar94@gmail.com"
          : "I couldn't reach the server. Reach Yash directly at yashdevdarekar94@gmail.com"
      );
    } finally {
      setBusy(false);
    }
  };

  const switchMode = (m) => {
    if (m === mode || busy) return;
    setMode(m);
    // ⚠️ The two modes do NOT share a fact base: on-device runs a condensed profile to fit a
    //    4,096-token window. Carrying a cloud transcript into it would push those facts out of
    //    context, so the conversation restarts and says so rather than degrading silently.
    if (msgs.length) {
      setMsgs([]);
      setLoad(null);
    }
  };

  const panelBg = dk ? 'rgba(10,15,26,0.97)' : 'rgba(255,255,255,0.98)';
  const border = dk ? 'rgba(99,102,241,0.25)' : 'rgba(99,102,241,0.2)';

  // 🐛 THIS LINE USED TO READ `if (!API) return null;` AND IT DELETED THE FEATURE AT BUILD TIME.
  //    Vite replaces import.meta.env.VITE_CHAT_API with a literal, so with no .env the guard
  //    became `if (!'') return null` — statically always true — and Rollup dead-code-eliminated
  //    the entire component, the dynamic import of web-llm included. The build printed a clean
  //    218kB bundle with no chat in it at all. A build that succeeds while removing the thing
  //    you are shipping is the worst kind of green.
  //
  //    It was also wrong on its own terms: ON-DEVICE MODE NEEDS NO WORKER. With no API
  //    configured the local path still works perfectly, so the widget stays and runs local-only.
  if (!API && !hasWebGPU) return null;

  return (
    <>
      {!open && (
        <button
          onClick={() => setOpen(true)}
          aria-label="Ask about Yash"
          style={{
            position: 'fixed', right: 20, bottom: 20, zIndex: 60,
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '12px 18px', borderRadius: 999, border: 'none', cursor: 'pointer',
            background: `linear-gradient(135deg, ${ACCENT}, #8b5cf6)`, color: '#fff',
            fontSize: '0.9rem', fontWeight: 600, fontFamily: 'inherit',
            boxShadow: '0 8px 28px rgba(99,102,241,0.45)',
          }}
        >
          <Sparkles size={17} /> Ask about Yash
        </button>
      )}

      {open && (
        <div
          role="dialog"
          aria-label="Ask about Yash"
          style={{
            position: 'fixed', zIndex: 60,
            ...(narrow
              // Full screen on a phone. `100dvh` tracks the DYNAMIC viewport, so it shrinks when
              // the keyboard opens and when the address bar is showing; `100vh` does neither.
              ? { inset: 0, width: '100%', height: DVH, borderRadius: 0 }
              : {
                  right: 20, bottom: 20,
                  width: 'min(400px, calc(100vw - 40px))',
                  height: 'min(560px, calc(100vh - 40px))',
                  borderRadius: 16,
                }),
            display: 'flex', flexDirection: 'column',
            background: panelBg, border: narrow ? 'none' : `1px solid ${border}`,
            boxShadow: narrow ? 'none' : '0 20px 60px rgba(0,0,0,0.35)',
            backdropFilter: 'blur(14px)', overflow: 'hidden',
            paddingBottom: narrow ? 'env(safe-area-inset-bottom)' : 0,
          }}
        >
          <div style={{
            padding: '12px 15px 10px',
            borderBottom: `1px solid ${dk ? 'rgba(255,255,255,0.07)' : 'rgba(15,23,42,0.07)'}`,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 30, height: 30, borderRadius: 9, display: 'grid', placeItems: 'center',
                background: `linear-gradient(135deg, ${ACCENT}, #8b5cf6)`, color: '#fff', flex: 'none',
              }}>
                <Bot size={17} />
              </div>
              <div style={{ lineHeight: 1.3, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: '0.9rem', color: dk ? '#f3f4f6' : '#111827' }}>
                  Ask about Yash
                </div>
                {/* ⛔ Not decoration. A recruiter must never be unsure whether they are talking to
                    a person. Saying it plainly is also the part that demonstrates the skill, so it
                    stays visible rather than hidden in a tooltip. */}
                <div style={{ fontSize: '0.72rem', color: dk ? '#9ca3af' : '#6b7280' }}>
                  AI assistant · answers about Yash, from his verified background
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                aria-label="Close"
                style={{
                  marginLeft: 'auto', background: 'transparent', border: 'none', cursor: 'pointer',
                  color: dk ? '#9ca3af' : '#6b7280', display: 'grid',
                  placeItems: 'center', flex: 'none',
                  width: 44, height: 44, margin: '-10px -10px -10px auto',   // 44px target, same visual size
                }}
              >
                <X size={17} />
              </button>
            </div>

            <div
              role="group"
              aria-label="Where the model runs"
              style={{
                display: 'flex', gap: 2, padding: 2, marginTop: 9, borderRadius: 8,
                width: 'fit-content',
                background: dk ? 'rgba(255,255,255,0.05)' : 'rgba(15,23,42,0.05)',
              }}
            >
              {[
                ...(API ? [{ k: 'cloud', Icon: Cloud, label: 'Cloud', title: 'Runs on Cloudflare Workers AI' }] : []),
                {
                  k: 'local', Icon: Cpu, label: 'On device',
                  title: hasWebGPU
                    ? `Runs entirely in your browser. Downloads ~${LOCAL_MODEL_MB}MB the first time.`
                    : 'Needs WebGPU, which this browser does not have',
                },
              ].map(({ k, Icon, label, title }) => (
                <button
                  key={k}
                  onClick={() => switchMode(k)}
                  disabled={k === 'local' && !hasWebGPU}
                  title={title}
                  aria-pressed={mode === k}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
                    padding: '0 12px', minHeight: 36, borderRadius: 6, border: 'none',
                    fontSize: '0.71rem', fontFamily: 'inherit', fontWeight: 600,
                    cursor: k === 'local' && !hasWebGPU ? 'not-allowed' : 'pointer',
                    background: mode === k ? ACCENT : 'transparent',
                    color: mode === k ? '#fff'
                      : k === 'local' && !hasWebGPU ? (dk ? '#4b5563' : '#cbd5e1')
                      : dk ? '#9ca3af' : '#6b7280',
                  }}
                >
                  <Icon size={12} /> {label}
                </button>
              ))}
            </div>
          </div>

          <div
            ref={scrollerRef}
            style={{ flex: 1, overflowY: 'auto', overscrollBehavior: 'contain', padding: '15px 15px 4px' }}
          >
            {msgs.length === 0 && (
              <div style={{ marginBottom: 14 }}>
                <p style={{
                  fontSize: '0.88rem', lineHeight: 1.6, margin: '0 0 10px',
                  color: dk ? '#d1d5db' : '#374151',
                }}>
                  Hi, I&apos;m an AI assistant Yash built for this site. Ask me what he&apos;s
                  shipped, how he works, or whether he fits a role you&apos;re hiring for.
                </p>
                {/* ⛔ The cost of on-device mode is the visitor's bandwidth, so it is stated
                    BEFORE they commit to it, not discovered during a progress bar. */}
                <p style={{
                  fontSize: '0.76rem', lineHeight: 1.55, margin: '0 0 14px',
                  color: dk ? '#9ca3af' : '#6b7280',
                }}>
                  {mode === 'local'
                    ? `On-device mode: the model runs entirely in your browser and nothing you type leaves it. ${cached ? 'It is already downloaded, so answers start immediately.' : `Your first question downloads about ${LOCAL_MODEL_MB}MB.`} It is a small model, so answers are shorter than Cloud.`
                    : 'Running on Cloudflare Workers AI. Switch to On device above to run the model in your own browser instead.'}
                </p>
                {/* ⛔ If this page put ~880MB on someone's disk, it owes them a way to see that and
                    take it back, without hunting through DevTools. Shown whenever the cache
                    exists, in either mode, because the bytes are there either way. */}
                {cached && (
                  <p style={{ fontSize: '0.74rem', margin: '0 0 14px', color: dk ? '#9ca3af' : '#6b7280' }}>
                    ~{LOCAL_MODEL_MB}MB of model weights are stored in this browser.{' '}
                    <button
                      onClick={async () => {
                        if (await clearModelCache()) {
                          engineRef.current = null;
                          enginePromise = null;
                          setCached(false);
                        }
                      }}
                      style={{
                        background: 'none', border: 'none', padding: 0, cursor: 'pointer',
                        font: 'inherit', color: ACCENT, textDecoration: 'underline',
                      }}
                    >
                      Remove them
                    </button>
                  </p>
                )}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                  {OPENERS.map((q) => (
                    <button
                      key={q}
                      onClick={() => send(q)}
                      style={{
                        padding: '0 14px', minHeight: 38, borderRadius: 999, cursor: 'pointer',
                        display: 'inline-flex', alignItems: 'center',
                        border: `1px solid ${border}`, background: 'transparent',
                        color: dk ? '#c7d2fe' : '#4338ca',
                        fontSize: '0.78rem', fontFamily: 'inherit',
                      }}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {msgs.map((m, i) => {
              const lastUser = m.role === 'user'
                && !msgs.slice(i + 1).some((x) => x.role === 'user');
              return (
                <div key={i} ref={lastUser ? anchorRef : undefined} style={{ scrollMarginTop: 2 }}>
                  <Bubble role={m.role} text={m.content} dk={dk} streaming={m.streaming} />
                </div>
              );
            })}

            {busy && load && (
              <div style={{ padding: '4px 2px 14px' }}>
                <div style={{
                  fontSize: '0.75rem', marginBottom: 6, color: dk ? '#9ca3af' : '#6b7280',
                }}>
                  {load.pct > 0 ? `Downloading model… ${load.pct}%` : load.text}
                </div>
                <div style={{
                  height: 4, borderRadius: 2, overflow: 'hidden',
                  background: dk ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.08)',
                }}>
                  <div style={{
                    height: '100%', width: `${load.pct}%`, background: ACCENT,
                    transition: 'width 0.3s ease',
                  }} />
                </div>
                <div style={{ fontSize: '0.7rem', marginTop: 6, color: dk ? '#6b7280' : '#9ca3af' }}>
                  One time only. Your browser caches it.
                </div>
              </div>
            )}

            {busy && !load && !msgs[msgs.length - 1]?.streaming && (
              <div style={{ display: 'flex', gap: 5, padding: '6px 2px 12px' }}>
                {[0, 1, 2].map((i) => (
                  <span key={i} style={{
                    width: 6, height: 6, borderRadius: '50%', background: ACCENT,
                    animation: 'pulse 1.1s ease-in-out infinite', animationDelay: `${i * 0.16}s`,
                  }} />
                ))}
              </div>
            )}
            {/* Tail padding, so a short answer can still sit at the top of the panel after the
                question is pinned there. Without it the browser cannot scroll far enough. */}
            <div ref={endRef} style={{ minHeight: '60%' }} />
          </div>

          <form
            onSubmit={(e) => { e.preventDefault(); send(); }}
            style={{
              display: 'flex', gap: 8, padding: 12,
              borderTop: `1px solid ${dk ? 'rgba(255,255,255,0.07)' : 'rgba(15,23,42,0.07)'}`,
            }}
          >
            <input
              ref={inputRef}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Ask anything about his work"
              maxLength={1500}
              style={{
                flex: 1, minWidth: 0, padding: '10px 13px', borderRadius: 10,
                border: `1px solid ${dk ? 'rgba(255,255,255,0.1)' : 'rgba(15,23,42,0.12)'}`,
                background: dk ? 'rgba(255,255,255,0.04)' : '#fff',
                color: dk ? '#e5e7eb' : '#111827',
                fontSize: '0.88rem', fontFamily: 'inherit', outline: 'none',
              }}
            />
            <button
              type="submit"
              disabled={busy || !draft.trim()}
              aria-label="Send"
              style={{
                padding: '0 14px', borderRadius: 10, border: 'none',
                cursor: busy || !draft.trim() ? 'default' : 'pointer',
                background: busy || !draft.trim() ? (dk ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.1)') : ACCENT,
                color: '#fff', display: 'grid', placeItems: 'center',
              }}
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      )}
    </>
  );
};

export default AskYash;
