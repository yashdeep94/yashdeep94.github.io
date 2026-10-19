import { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, X, Bot } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

// 🚨 The endpoint is a Cloudflare Worker, not this app. A static build cannot hold an API key:
//    `vite build` INLINES every VITE_ variable into the bundle, so a key here is public. The URL
//    is fine to expose; the Worker is what holds the secret and checks the origin. See worker/.
const API = import.meta.env.VITE_CHAT_API || '';

const ACCENT = '#6366f1';

const OPENERS = [
  'What has he actually built?',
  'Is he a fit for an AI/ML role?',
  'Tell me about LISA',
  'When can he start?',
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
    try {
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
    } catch {
      // ⛔ Say what to do next. A dead chat widget on a portfolio is worse than no widget, so the
      //    failure path always hands the recruiter a working way to reach him.
      setMsgs([...next, {
        role: 'assistant',
        content: "I couldn't reach the server. Reach Yash directly at yashdevdarekar94@gmail.com",
      }]);
    } finally {
      setBusy(false);
    }
  };

  const panelBg = dk ? 'rgba(10,15,26,0.97)' : 'rgba(255,255,255,0.98)';
  const border = dk ? 'rgba(99,102,241,0.25)' : 'rgba(99,102,241,0.2)';

  if (!API) return null;   // nothing configured: render nothing rather than a broken button

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
            display: 'flex', alignItems: 'center', gap: 10, padding: '13px 15px',
            borderBottom: `1px solid ${dk ? 'rgba(255,255,255,0.07)' : 'rgba(15,23,42,0.07)'}`,
          }}>
            <div style={{
              width: 30, height: 30, borderRadius: 9, display: 'grid', placeItems: 'center',
              background: `linear-gradient(135deg, ${ACCENT}, #8b5cf6)`, color: '#fff', flex: 'none',
            }}>
              <Bot size={17} />
            </div>
            <div style={{ lineHeight: 1.25, minWidth: 0 }}>
              <div style={{ fontWeight: 600, fontSize: '0.9rem', color: dk ? '#f3f4f6' : '#111827' }}>
                Ask about Yash
              </div>
              {/* ⛔ This line is not decoration. A recruiter must never be unsure whether they are
                  talking to a person. Saying it plainly is also the part that demonstrates the
                  skill, so it stays visible rather than hidden in a tooltip. */}
              <div style={{ fontSize: '0.72rem', color: dk ? '#9ca3af' : '#6b7280' }}>
                AI assistant · answers from his verified background
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              aria-label="Close"
              style={{
                marginLeft: 'auto', background: 'transparent', border: 'none', cursor: 'pointer',
                color: dk ? '#9ca3af' : '#6b7280', padding: 4, display: 'grid', placeItems: 'center',
              }}
            >
              <X size={17} />
            </button>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: '15px 15px 4px' }}>
            {msgs.length === 0 && (
              <div style={{ marginBottom: 14 }}>
                <p style={{
                  fontSize: '0.88rem', lineHeight: 1.6, margin: '0 0 14px',
                  color: dk ? '#d1d5db' : '#374151',
                }}>
                  Hi — I&apos;m an AI assistant Yash built for this site. Ask me what he&apos;s
                  shipped, how he works, or whether he fits a role you&apos;re hiring for.
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

            {busy && (
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
