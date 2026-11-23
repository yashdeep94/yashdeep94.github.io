import { useParams, Link } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { writing } from '../data/writing';
import StepDiagram from '../components/StepDiagram';
import { diagrams } from '../data/diagrams';

const Writing = () => {
  const { slug } = useParams();
  const { theme } = useTheme();
  const dk = theme === 'dark';
  const muted = dk ? '#9ca3af' : '#4b5563';
  const faint = dk ? '#6b7280' : '#9ca3af';
  const strong = dk ? '#e5e7eb' : '#111827';
  const wrap = { maxWidth: '680px', margin: '0 auto', padding: 'clamp(32px,7vw,72px) clamp(20px,5vw,24px)' };

  // Index
  if (!slug) {
    return (
      <section style={wrap}>
        <h1 style={{ fontSize: 'clamp(24px,4vw,32px)', fontWeight: 700, color: strong, margin: '0 0 8px' }}>
          Writing
        </h1>
        <p style={{ color: faint, margin: '0 0 36px', fontSize: '15px' }}>
          Long-form notes on systems I have built and operated.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '26px' }}>
          {writing.map((a) => (
            <article key={a.slug}>
              <Link
                to={`/writing/${a.slug}`}
                style={{ color: strong, fontWeight: 600, fontSize: '17px', textDecoration: 'none', lineHeight: 1.4 }}
              >
                {a.title}
              </Link>
              <div style={{ color: faint, fontSize: '13px', margin: '5px 0 7px' }}>{a.date}</div>
              <p style={{ margin: 0, color: muted, fontSize: '15px', lineHeight: 1.65 }}>{a.summary}</p>
            </article>
          ))}
        </div>
      </section>
    );
  }

  const a = writing.find((x) => x.slug === slug);
  if (!a) {
    return (
      <section style={wrap}>
        <p style={{ color: muted }}>Not found. <Link to="/writing" style={{ color: '#818cf8' }}>Back to writing</Link></p>
      </section>
    );
  }

  return (
    <section style={wrap}>
      <Link to="/writing" style={{ color: faint, fontSize: '13px', textDecoration: 'none', display: 'inline-block', padding: '6px 2px' }}>&larr; Writing</Link>
      <h1 style={{ fontSize: 'clamp(24px,4vw,34px)', fontWeight: 700, color: strong, margin: '16px 0 6px', lineHeight: 1.25 }}>
        {a.title}
      </h1>
      <div style={{ color: faint, fontSize: '13px', marginBottom: '32px' }}>{a.date}</div>
      {a.sections.map((s) => (
        <div key={s.h} style={{ marginBottom: '34px' }}>
          <h2 style={{ fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.14em', fontWeight: 600, color: faint, margin: '0 0 12px' }}>
            {s.h}
          </h2>
          {s.p.map((t, i) => (
            <p key={i} style={{ margin: '0 0 14px', color: muted, fontSize: '16px', lineHeight: 1.75 }}>{t}</p>
          ))}
          {s.diagram && diagrams[s.diagram] && (
            <StepDiagram nodes={diagrams[s.diagram].nodes} steps={diagrams[s.diagram].steps} />
          )}
        </div>
      ))}
    </section>
  );
};

export default Writing;
