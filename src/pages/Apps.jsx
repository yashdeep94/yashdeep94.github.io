import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Braces, Search, Palette, FileText, ArrowLeftRight, Shield,
  Sparkles, ArrowRight, Construction
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { apps } from '../data/content';

const iconMap = { Braces, Search, Palette, FileText, ArrowLeftRight, Shield };

const Apps = () => {
  const { theme } = useTheme();
  const dk = theme === 'dark';
  const [visible, setVisible] = useState(false);

  useEffect(() => { setVisible(true); }, []);

  return (
    <div style={{ minHeight: '100vh', padding: '120px 24px 80px', position: 'relative', zIndex: 1 }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        {/* Header */}
        <div
          className={visible ? 'animate-fade-up fill-both' : ''}
          style={{ opacity: 0, textAlign: 'center', marginBottom: '60px' }}
        >
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            padding: '6px 16px', borderRadius: '50px',
            fontSize: '12px', fontWeight: 600, letterSpacing: '2px', textTransform: 'uppercase',
            color: '#6366f1',
            background: dk ? 'rgba(99,102,241,0.1)' : 'rgba(99,102,241,0.08)',
            border: `1px solid ${dk ? 'rgba(99,102,241,0.2)' : 'rgba(99,102,241,0.12)'}`,
            marginBottom: '16px',
          }}>
            <Sparkles size={14} /> Interactive Tools
          </span>
          <h1 style={{
            fontSize: 'clamp(28px, 5vw, 48px)', fontWeight: 800,
            color: dk ? '#fff' : '#111827', letterSpacing: '-1px', marginBottom: '12px',
          }}>
            Useful <span className="gradient-text">Mini Apps</span>
          </h1>
          <p style={{
            fontSize: '17px', color: dk ? '#6b7280' : '#9ca3af',
            maxWidth: '550px', margin: '0 auto', lineHeight: 1.7,
          }}>
            Handy developer tools I've built — each showcasing different skills and technologies.
          </p>
        </div>

        {/* Apps Grid */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px',
        }}>
          {apps.map((app, i) => {
            const Icon = iconMap[app.icon] || Braces;
            return (
              <div
                key={app.id}
                className={`hover-lift glass-card ${visible ? 'animate-fade-up fill-both' : ''}`}
                style={{
                  opacity: 0, animationDelay: `${0.15 + i * 0.1}s`,
                  padding: '32px', borderRadius: '20px',
                  background: dk ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.7)',
                  position: 'relative', overflow: 'hidden',
                  transition: 'all 0.4s ease',
                }}
                onMouseEnter={e => e.currentTarget.style.borderColor = `${app.color}40`}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'}
              >
                {/* Corner glow */}
                <div style={{
                  position: 'absolute', top: 0, right: 0, width: '150px', height: '150px',
                  background: `radial-gradient(circle, ${app.color}08 0%, transparent 70%)`,
                  pointerEvents: 'none',
                }} />

                {/* Icon */}
                <div style={{
                  width: '52px', height: '52px', borderRadius: '14px',
                  background: `${app.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: app.color, marginBottom: '20px',
                }}>
                  <Icon size={24} />
                </div>

                {/* Title */}
                <h3 style={{
                  fontSize: '19px', fontWeight: 700, marginBottom: '10px',
                  color: dk ? '#f3f4f6' : '#111827',
                  display: 'flex', alignItems: 'center', gap: '10px',
                }}>
                  {app.title}
                  {!app.ready && (
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: '4px',
                      fontSize: '11px', fontWeight: 600, padding: '3px 10px', borderRadius: '6px',
                      background: dk ? 'rgba(251,191,36,0.1)' : 'rgba(251,191,36,0.15)',
                      color: '#f59e0b',
                    }}>
                      <Construction size={12} /> Soon
                    </span>
                  )}
                </h3>

                {/* Description */}
                <p style={{
                  fontSize: '14px', lineHeight: 1.7, marginBottom: '20px',
                  color: dk ? '#9ca3af' : '#6b7280',
                }}>
                  {app.description}
                </p>

                {/* Tags */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '20px' }}>
                  {app.tags.map(tag => (
                    <span key={tag} style={{
                      padding: '4px 10px', borderRadius: '6px',
                      fontSize: '11px', fontWeight: 600, fontFamily: "'Fira Code', monospace",
                      color: app.color, background: `${app.color}10`, border: `1px solid ${app.color}20`,
                    }}>
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Action */}
                {app.ready ? (
                  <Link
                    to={app.route}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: '8px',
                      fontSize: '14px', fontWeight: 600, color: app.color,
                      textDecoration: 'none', transition: 'gap 0.3s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.gap = '14px'}
                    onMouseLeave={e => e.currentTarget.style.gap = '8px'}
                  >
                    Launch App <ArrowRight size={16} />
                  </Link>
                ) : (
                  <span style={{ fontSize: '14px', fontWeight: 500, color: dk ? '#4b5563' : '#9ca3af' }}>
                    Coming soon...
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div
          className={visible ? 'animate-fade-up fill-both delay-800' : ''}
          style={{
            opacity: 0, textAlign: 'center', marginTop: '60px',
            padding: '40px', borderRadius: '20px',
            background: dk ? 'rgba(99,102,241,0.05)' : 'rgba(99,102,241,0.03)',
            border: `1px solid ${dk ? 'rgba(99,102,241,0.1)' : 'rgba(99,102,241,0.08)'}`,
          }}
        >
          <Sparkles size={24} style={{ color: '#6366f1', margin: '0 auto 12px' }} />
          <p style={{
            fontSize: '16px', fontWeight: 600, color: dk ? '#d1d5db' : '#374151', marginBottom: '6px',
          }}>
            More apps coming soon!
          </p>
          <p style={{ fontSize: '14px', color: dk ? '#6b7280' : '#9ca3af' }}>
            I'm building new tools regularly. Check back or follow my GitHub for updates.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Apps;