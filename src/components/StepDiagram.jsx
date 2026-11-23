import { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';

// A stepped diagram: N boxes, one caption per step, the active box highlighted. It exists for
// cases where the thing that is hard to
// explain here is ORDERING AND FAILURE — why an outbox, why an idempotency key, why one FIFO
// lane per provider login — and a static picture cannot show a retry arriving twice.
// Inline SVG, no animation library, no canvas. Keyboard operable. Honours reduced motion by
// only ever transitioning colour, never position.


const StepDiagram = ({ nodes, steps }) => {
  const { theme } = useTheme();
  const dk = theme === 'dark';
  const [i, setI] = useState(0);
  const step = steps[i];

  const dim = dk ? '#374151' : '#d1d5db';
  const text = dk ? '#9ca3af' : '#6b7280';
  const on = '#818cf8';
  const strong = dk ? '#e5e7eb' : '#111827';

  const n = nodes.length;
  const W = 660, H = 110, bw = Math.floor((W - 12 * (n - 1)) / n), bh = 46, gap = 12;
  const x = (n) => n * (bw + gap);

  return (
    <figure style={{ margin: '0 0 34px' }}>
      <div style={{ overflowX: 'auto', paddingBottom: '4px' }}>
        <svg
          viewBox={`0 0 ${W} ${H}`} width="100%" style={{ minWidth: '560px', display: 'block' }}
          role="img"
          aria-label={`Step ${i + 1} of ${steps.length}: ${step.title}. ${step.body}`}
        >
          {nodes.map((n, k) => {
            const active = k === step.node;
            return (
              <g key={n.label}>
                {k < nodes.length - 1 && (
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
        {steps.map((s, k) => (
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

export default StepDiagram;
