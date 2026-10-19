import { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, X, Bot, Cloud, Cpu } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { LOCAL_SYSTEM, LOCAL_MODEL, LOCAL_MODEL_MB } from '../data/localProfile';

// 🚨 The endpoint is a Cloudflare Worker, not this app. A static build cannot hold an API key:
//    `vite build` INLINES every VITE_ variable into the bundle, so a key here is public. The URL
//    is fine to expose; the Worker is what holds the secret and checks the origin. See worker/.
const API = import.meta.env.VITE_CHAT_API || '';

const ACCENT = '#6366f1';

// WebGPU is the hard requirement for on-device mode and a meaningful share of visitors lack it,
// mobile worst of all. Detect rather than assume: a toggle that fails on click is worse than a
// toggle that is honestly disabled.
const hasWebGPU = typeof navigator !== 'undefined' && 'gpu' in navigator;

// 🚨 The engine is ~14MB of JS plus ~880MB of weights. It is dynamically imported on FIRST USE of
//    on-device mode, never at page load, so a recruiter who never touches the toggle pays nothing
//    for its existence. Vite code-splits it into its own chunk automatically.
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

const Bubble = ({ role, text, dk }) => {
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
          whiteSpace: 'pre-wrap',
          background: mine ? ACCENT : dk ? 'rgba(255,255,255,0.06)' : 'rgba(15,23,42,0.05)',
          color: mine ? '#fff' : dk ? '#e5e7eb' : '#1f2937',
          border: mine ? 'none' : `1px solid ${dk ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.08)'}`,
        }}
      >
        {text}
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
  const engineRef = useRef(null);
  const endRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [msgs, busy]);
  useEffect(() => { if (open) inputRef.current?.focus(); }, [open]);
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
      if (mode === 'local') {
        // ── ON DEVICE. Nothing leaves the browser; no request is made at all.
        const engine =
          engineRef.current ||
          (engineRef.current = await getEngine((p) => {
            const pct = Math.round((p.progress || 0) * 100);
            setLoad({ pct, text: p.text || 'Loading model' });
          }));
        setLoad(null);
        const r = await engine.chat.completions.create({
          messages: [{ role: 'system', content: LOCAL_SYSTEM }, ...next],
          temperature: 0.3,
          max_tokens: 400,
        });
        setMsgs([...next, {
          role: 'assistant',
          content: r.choices?.[0]?.message?.content?.trim() || "I didn't catch that. Could you rephrase?",
        }]);
      } else {
        // ── CLOUD. The Worker owns the prompt and the facts.
        const r = await fetch(API, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: next }),
        });
        const data = await r.json();
        setMsgs([...next, {
          role: 'assistant',
          content: data.reply || data.error || 'Something went wrong. Email yash at yashdevdarekar94@gmail.com',
        }]);
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
            position: 'fixed', right: 20, bottom: 20, zIndex: 60,
            width: 'min(400px, calc(100vw - 40px))',
            height: 'min(560px, calc(100vh - 40px))',
            display: 'flex', flexDirection: 'column',
            background: panelBg, border: `1px solid ${border}`, borderRadius: 16,
            boxShadow: '0 20px 60px rgba(0,0,0,0.35)', backdropFilter: 'blur(14px)',
            overflow: 'hidden',
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
                  AI assistant · answers from his verified background
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                aria-label="Close"
                style={{
                  marginLeft: 'auto', background: 'transparent', border: 'none', cursor: 'pointer',
                  color: dk ? '#9ca3af' : '#6b7280', padding: 4, display: 'grid',
                  placeItems: 'center', flex: 'none',
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
                    display: 'flex', alignItems: 'center', gap: 5,
                    padding: '5px 10px', borderRadius: 6, border: 'none',
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

          <div style={{ flex: 1, overflowY: 'auto', padding: '15px 15px 4px' }}>
            {msgs.length === 0 && (
              <div style={{ marginBottom: 14 }}>
                <p style={{
                  fontSize: '0.88rem', lineHeight: 1.6, margin: '0 0 10px',
                  color: dk ? '#d1d5db' : '#374151',
                }}>
                  Hi — I&apos;m an AI assistant Yash built for this site. Ask me what he&apos;s
                  shipped, how he works, or whether he fits a role you&apos;re hiring for.
                </p>
                {/* ⛔ The cost of on-device mode is the visitor's bandwidth, so it is stated
                    BEFORE they commit to it, not discovered during a progress bar. */}
                <p style={{
                  fontSize: '0.76rem', lineHeight: 1.55, margin: '0 0 14px',
                  color: dk ? '#9ca3af' : '#6b7280',
                }}>
                  {mode === 'local'
                    ? `On-device mode: the model runs entirely in your browser and nothing you type leaves it. First question downloads about ${LOCAL_MODEL_MB}MB, and it is a small model, so answers are shorter than Cloud.`
                    : 'Running on Cloudflare Workers AI. Switch to On device above to run the model in your own browser instead.'}
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                  {OPENERS.map((q) => (
                    <button
                      key={q}
                      onClick={() => send(q)}
                      style={{
                        padding: '7px 12px', borderRadius: 999, cursor: 'pointer',
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

            {msgs.map((m, i) => <Bubble key={i} role={m.role} text={m.content} dk={dk} />)}

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
                  One time only — your browser caches it.
                </div>
              </div>
            )}

            {busy && !load && (
              <div style={{ display: 'flex', gap: 5, padding: '6px 2px 12px' }}>
                {[0, 1, 2].map((i) => (
                  <span key={i} style={{
                    width: 6, height: 6, borderRadius: '50%', background: ACCENT,
                    animation: 'pulse 1.1s ease-in-out infinite', animationDelay: `${i * 0.16}s`,
                  }} />
                ))}
              </div>
            )}
            <div ref={endRef} />
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
