import { Link } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { work, featured, otherProjects } from '../data/content';

// Structure follows the pattern every infra-engineer site shares: Work as one line per
// employer, then ONE project with a paragraph and the rest as one-liners. The full list
// lives elsewhere, never on the homepage.
const Work = () => {
  const { theme } = useTheme();
  const dk = theme === 'dark';
  const muted = dk ? '#9ca3af' : '#6b7280';
  const faint = dk ? '#6b7280' : '#9ca3af';
  const rule = dk ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';

  const H = ({ children }) => (
    <h2 style={{
      fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.18em',
      fontWeight: 600, color: faint, margin: '0 0 20px',
    }}>{children}</h2>
  );

  return (
    <section style={{
      maxWidth: '720px', margin: '0 auto',
      padding: 'clamp(32px, 7vw, 72px) clamp(20px, 5vw, 24px)',
    }}>
      <H>Work</H>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', marginBottom: '56px' }}>
        {work.map((w) => (
          <div key={w.org}>
            <div style={{
              display: 'flex', flexWrap: 'wrap', alignItems: 'baseline',
              gap: '8px', marginBottom: '6px',
            }}>
              <span style={{ fontWeight: 600, color: dk ? '#e5e7eb' : '#111827' }}>{w.org}</span>
              <span style={{ color: faint, fontSize: '14px' }}>{w.role}</span>
              <span style={{ marginLeft: 'auto', color: faint, fontSize: '13px', whiteSpace: 'nowrap' }}>
                {w.when}
              </span>
            </div>
            <p style={{ margin: 0, color: muted, fontSize: '15px', lineHeight: 1.65 }}>{w.line}</p>
            {w.href && (
              <Link
                to={w.href}
                style={{
                  display: 'inline-block', marginTop: '8px', fontSize: '14px',
                  color: dk ? '#a78bfa' : '#6366f1', textDecoration: 'none',
                  borderBottom: `1px solid ${dk ? '#a78bfa40' : '#6366f140'}`,
                }}
              >{w.hrefLabel}</Link>
            )}
          </div>
        ))}
      </div>

      <H>Selected work</H>
      <div style={{
        borderLeft: `2px solid ${dk ? '#6366f1' : '#818cf8'}`,
        paddingLeft: '18px', marginBottom: '48px',
      }}>
        <h3 style={{
          margin: '0 0 10px', fontSize: '17px', fontWeight: 600,
          color: dk ? '#e5e7eb' : '#111827',
        }}>{featured.title}</h3>
        <p style={{ margin: '0 0 14px', color: muted, fontSize: '15px', lineHeight: 1.7 }}>
          {featured.body}
        </p>
        <Link
          to="/writing/serverless-rebuild"
          style={{
            display: 'inline-block', marginBottom: '14px', fontSize: '14px',
            color: dk ? '#a78bfa' : '#6366f1', textDecoration: 'none',
            borderBottom: `1px solid ${dk ? '#a78bfa40' : '#6366f140'}`,
          }}
        >
          Read the write-up, including the case for not doing it
        </Link>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '4px' }}>
          {featured.stack.map((s) => (
            <span key={s} style={{
              fontSize: '12px', padding: '3px 9px', borderRadius: '6px',
              border: `1px solid ${rule}`, color: faint,
              fontFamily: "'Fira Code','JetBrains Mono',monospace",
            }}>{s}</span>
          ))}
        </div>
      </div>

      <H>Also</H>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
        {otherProjects.map((p) => (
          <div key={p.name}>
            <div style={{ fontWeight: 600, marginBottom: '4px', color: dk ? '#d1d5db' : '#1f2937' }}>
              {p.name}
            </div>
            <p style={{ margin: 0, color: muted, fontSize: '14px', lineHeight: 1.6 }}>
              {p.line}
              {p.href && (
                <>
                  {' '}
                  <Link to={p.href} style={{ color: dk ? '#a78bfa' : '#6366f1', textDecoration: 'none',
                    borderBottom: `1px solid ${dk ? '#a78bfa40' : '#6366f140'}` }}>Read more</Link>
                </>
              )}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Work;
