import { useState, useEffect, useRef } from 'react';
import { Code2, Layout, Server, Database, Cloud, Wrench, Brain, FlaskConical } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { technologies } from '../data/content';

const catIcons = {
  Languages: Code2,
  Frontend: Layout,
  'Backend & APIs': Server,
  Databases: Database,
  'Cloud & DevOps': Cloud,
  'AI / ML & Data': Brain,
  'Tools & Testing': Wrench,
};

const catColors = {
  Languages: '#f59e0b',
  Frontend: '#3b82f6',
  'Backend & APIs': '#10b981',
  Databases: '#ec4899',
  'Cloud & DevOps': '#8b5cf6',
  'AI / ML & Data': '#f97316',
  'Tools & Testing': '#6366f1',
};

const Technologies = () => {
  const { theme } = useTheme();
  const dk = theme === 'dark';
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.1 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <section ref={ref} style={{ padding: '100px 24px', position: 'relative', zIndex: 1 }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        {/* Section Header */}
        <div
          className={visible ? 'animate-fade-up fill-both' : ''}
          style={{ opacity: 0, textAlign: 'center', marginBottom: '60px' }}
        >
          <span style={{
            display: 'inline-block', padding: '6px 16px', borderRadius: '50px',
            fontSize: '12px', fontWeight: 600, letterSpacing: '2px', textTransform: 'uppercase',
            color: '#6366f1',
            background: dk ? 'rgba(99,102,241,0.1)' : 'rgba(99,102,241,0.08)',
            border: `1px solid ${dk ? 'rgba(99,102,241,0.2)' : 'rgba(99,102,241,0.12)'}`,
            marginBottom: '16px',
          }}>
            Tech Stack
          </span>
          <h2 style={{
            fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 800,
            color: dk ? '#fff' : '#111827', letterSpacing: '-1px',
          }}>
            Technologies I <span className="gradient-text">Work With</span>
          </h2>
          <p style={{
            fontSize: '16px', color: dk ? '#6b7280' : '#6b7280',
            maxWidth: '500px', margin: '12px auto 0',
          }}>
            My toolkit for building modern, scalable applications
          </p>
        </div>

        {/* Tech Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', alignItems: 'start',
          gap: '24px',
        }}>
          {technologies.map((cat, i) => {
            const Icon = catIcons[cat.name] || Code2;
            const color = catColors[cat.name] || '#6366f1';

            return (
              <div
                key={cat.name}
                className={`hover-lift glass-card ${visible ? 'animate-fade-up fill-both' : ''}`}
                style={{
                  opacity: 0,
                  animationDelay: `${0.1 + i * 0.1}s`,
                  padding: '28px',
                  borderRadius: '20px',
                  background: dk ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.7)',
                  transition: 'all 0.4s ease',
                  cursor: 'default',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = `${color}40`;
                  e.currentTarget.style.background = dk ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.9)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                  e.currentTarget.style.background = dk ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.7)';
                }}
              >
                {/* Category header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                  <div style={{
                    width: '42px', height: '42px', borderRadius: '12px',
                    background: `${color}15`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: color,
                  }}>
                    <Icon size={20} />
                  </div>
                  <h3 style={{
                    fontSize: '17px', fontWeight: 700,
                    color: dk ? '#f3f4f6' : '#111827',
                  }}>
                    {cat.name}
                  </h3>
                </div>

                {/* Chips */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {cat.items.map(item => (
                    <span
                      key={item}
                      style={{
                        padding: '6px 14px', borderRadius: '8px',
                        fontSize: '13px', fontWeight: 500,
                        fontFamily: "'Fira Code', monospace",
                        color: dk ? '#d1d5db' : '#374151',
                        background: dk ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
                        border: `1px solid ${dk ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
                        transition: 'all 0.2s ease',
                        cursor: 'default',
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.color = color;
                        e.currentTarget.style.borderColor = `${color}40`;
                        e.currentTarget.style.background = `${color}10`;
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.color = dk ? '#d1d5db' : '#374151';
                        e.currentTarget.style.borderColor = dk ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';
                        e.currentTarget.style.background = dk ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)';
                      }}
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Technologies;