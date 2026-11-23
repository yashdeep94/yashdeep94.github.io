import { stackIcons } from '../data/stackIcons';
import { useTheme } from '../contexts/ThemeContext';

// Monochrome, one weight, one size. A multicolour logo wall is the commonest portfolio
// section there is; rendering the marks normalised and single-colour is what makes it read
// as considered instead of as a sticker sheet. simple-icons paths are MIT-licensed and
// already normalised, which also sidesteps per-brand usage guidelines.
// ⛔ AWS IS TEXT, NOT A LOGO, AND THAT IS DELIBERATE: Amazon had its marks removed from
//    simple-icons, which tells you exactly which brand polices them. The AWS services sit in
//    the same cells as label-only chips so the row reads as a choice rather than a gap.

const TEXT = ['Lambda', 'DynamoDB', 'SQS', 'CloudFront', 'LangGraph', 'MLflow'];

const Cell = ({ children, label, dk, labelOnly }) => (
  <div
    title={label}
    style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', gap: 'var(--s-2)',
      padding: 'var(--s-3) var(--s-2)', borderRadius: '10px', minHeight: '74px',
      border: `1px solid ${dk ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
      color: dk ? '#9ca3af' : '#6b7280',
      transition: 'color var(--dur) var(--ease), border-color var(--dur) var(--ease)',
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.color = 'var(--accent-soft)';
      e.currentTarget.style.borderColor = dk ? 'rgba(129,140,248,0.35)' : 'rgba(99,102,241,0.3)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.color = dk ? '#9ca3af' : '#6b7280';
      e.currentTarget.style.borderColor = dk ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';
    }}
  >
    {children}
    <span style={{
      fontSize: labelOnly ? 'var(--t-sm)' : 'var(--t-xs)',
      letterSpacing: '0.01em', whiteSpace: 'nowrap',
      fontFamily: labelOnly ? "'Fira Code','JetBrains Mono',monospace" : undefined,
    }}>
      {label}
    </span>
  </div>
);

const Stack = () => {
  const { theme } = useTheme();
  const dk = theme === 'dark';

  return (
    <section style={{
      maxWidth: '720px', margin: '0 auto',
      padding: '0 clamp(20px, 5vw, 24px) var(--s-16)',
    }}>
      <h2 style={{
        fontSize: 'var(--t-xs)', textTransform: 'uppercase', letterSpacing: '0.18em',
        fontWeight: 600, color: dk ? '#6b7280' : '#9ca3af', margin: '0 0 var(--s-6)',
      }}>Stack</h2>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(min(84px, 100%), 1fr))',
        gap: 'var(--s-2)',
      }}>
        {stackIcons.map(([label, path]) => (
          <Cell key={label} label={label} dk={dk}>
            <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" aria-hidden="true">
              <path d={path} />
            </svg>
          </Cell>
        ))}
        {TEXT.map((label) => (
          <Cell key={label} label={label} dk={dk} labelOnly />
        ))}
      </div>
    </section>
  );
};

export default Stack;
