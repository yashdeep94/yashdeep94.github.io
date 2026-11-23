import { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';

// An interactive diagram of the recharge path. It exists because the thing that is hard to
// explain here is ORDERING AND FAILURE — why an outbox, why an idempotency key, why one FIFO
// lane per provider login — and a static picture cannot show a retry arriving twice.
// Inline SVG, no animation library, no canvas. Keyboard operable. Honours reduced motion by
// only ever transitioning colour, never position.
const STEPS = [
  {
    node: 0,
    title: 'A customer pays',
    body: 'A request arrives at CloudFront. Nothing has been charged and nothing has been written.',
  },
  {
    node: 1,
    title: 'The API does not move money',
    body: 'A Rust service on Lambda validates the request. It has no side effects of its own: everything that matters happens in the next step, as one write.',
  },
  {
    node: 2,
    title: 'One transactional write',
    body: 'The business rows, an outbox record and an idempotency key go into DynamoDB in a single transaction. A retry carrying the same key finds it already there and does nothing. At this point the payment is recorded but has still not been sent anywhere, and if everything downstream failed now the record would survive.',
  },
  {
    node: 3,
    title: 'The stream is the truth, the queue is a doorbell',
    body: 'A Rust relay reads the DynamoDB Stream. The queue that comes next is only a notification; the database stays the source of truth, and an outbox sweeper catches any doorbell that was lost.',
  },
  {
    node: 4,
    title: 'One lane per provider login',
    body: 'The relay enqueues on SQS FIFO with the message group set to the provider login. That keeps one money job per login in flight, which is a constraint of the upstream portal rather than of this system.',
  },
  {
    node: 5,
    title: 'The worker claims, it does not trust',
    body: 'The worker claims the job with a conditional update before acting. A redelivered message loses the claim and is routed through the same check used for ambiguous outcomes, so it cannot charge twice. The outcome is written back in one transaction, and what cannot be resolved lands in a dead-letter queue rather than disappearing.',
  },
];


const NODES = [
  { label: 'Customer', sub: 'CloudFront' },
  { label: 'public-api', sub: 'Rust / Lambda' },
  { label: 'DynamoDB', sub: 'txn + outbox' },
  { label: 'relay', sub: 'Rust' },
  { label: 'SQS FIFO', sub: 'per login' },
  { label: 'worker', sub: 'Playwright' },
];

const MoneyPath = () => {
  const { theme } = useTheme();
  const dk = theme === 'dark';
  const [i, setI] = useState(0);
  const step = STEPS[i];

  const dim = dk ? '#374151' : '#d1d5db';
  const text = dk ? '#9ca3af' : '#6b7280';
  const on = '#818cf8';
  const strong = dk ? '#e5e7eb' : '#111827';

  const W = 660, H = 110, bw = 92, bh = 46, gap = (W - bw * 6) / 5;
  const x = (n) => n * (bw + gap);

  return (
    <figure style={{ margin: '0 0 34px' }}>
      <div style={{ overflowX: 'auto', paddingBottom: '4px' }}>
        <svg
          viewBox={`0 0 ${W} ${H}`} width="100%" style={{ minWidth: '560px', display: 'block' }}
          role="img"
          aria-label={`Recharge path, step ${i + 1} of ${STEPS.length}: ${step.title}. ${step.body}`}
        >
          {NODES.map((n, k) => {
            const active = k === step.node;
            return (
              <g key={n.label}>
                {k < NODES.length - 1 && (
                  <line
                    x1={x(k) + bw} y1={bh / 2 + 18} x2={x(k + 1)} y2={bh / 2 + 18}
                    stroke={k < step.node ? on : dim} strokeWidth="1.5"
                    style={{ transition: 'stroke 220ms ease' }}
                  />
                )}
                <rect
                  x={x(k)} y={18} width={bw} height={bh} rx="7"
                  fill="none" stroke={active ? on : dim} strokeWidth={active ? 2 : 1}
                  style={{ transition: 'stroke 220ms ease, stroke-width 220ms ease' }}
                />
                <text x={x(k) + bw / 2} y={38} textAnchor="middle"
                  style={{ fontSize: '11px', fontWeight: 600, fill: active ? on : strong,
                           transition: 'fill 220ms ease' }}>{n.label}</text>
                <text x={x(k) + bw / 2} y={53} textAnchor="middle"
                  style={{ fontSize: '9px', fill: text, fontFamily: "'Fira Code',monospace" }}>{n.sub}</text>
              </g>
            );
          })}
        </svg>
      </div>

      <div style={{ display: 'flex', gap: '6px', margin: '14px 0 12px', flexWrap: 'wrap' }}>
        {STEPS.map((s, k) => (
          <button
            key={s.title} onClick={() => setI(k)}
            aria-current={k === i ? 'step' : undefined}
            aria-label={`Step ${k + 1}: ${s.title}`}
            style={{
              width: '26px', height: '26px', borderRadius: '6px', cursor: 'pointer',
              border: `1px solid ${k === i ? on : dim}`,
              background: k === i ? `${on}1a` : 'transparent',
              color: k === i ? on : text, fontSize: '12px', fontWeight: 600,
              transition: 'all 180ms ease',
            }}
          >{k + 1}</button>
        ))}
      </div>

      <figcaption style={{ minHeight: '96px' }}>
        <div style={{ fontWeight: 600, color: strong, marginBottom: '6px', fontSize: '15px' }}>
          {step.title}
        </div>
        <p style={{ margin: 0, color: text, fontSize: '15px', lineHeight: 1.7 }}>{step.body}</p>
      </figcaption>
    </figure>
  );
};

export default MoneyPath;
