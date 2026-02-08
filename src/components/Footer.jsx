import { Github, Linkedin, Mail, ArrowUp, Heart } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { personalInfo } from '../data/content';

const Footer = () => {
  const { theme } = useTheme();
  const dk = theme === 'dark';

  const socials = [
    { icon: Github, href: personalInfo.github, label: 'GitHub' },
    { icon: Linkedin, href: personalInfo.linkedin, label: 'LinkedIn' },
    { icon: Mail, href: `mailto:${personalInfo.email}`, label: 'Email' },
  ];

  return (
    <footer style={{
      position: 'relative', zIndex: 1,
      borderTop: `1px solid ${dk ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
      padding: '40px 24px',
    }}>
      <div style={{
        maxWidth: '1100px', margin: '0 auto',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px',
      }}>
        {/* Back to top */}
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="magnetic-btn"
          style={{
            width: '44px', height: '44px', borderRadius: '14px',
            background: dk ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
            border: `1px solid ${dk ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: dk ? '#9ca3af' : '#6b7280',
            cursor: 'pointer', transition: 'all 0.3s',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.color = '#6366f1';
            e.currentTarget.style.borderColor = 'rgba(99,102,241,0.3)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.color = dk ? '#9ca3af' : '#6b7280';
            e.currentTarget.style.borderColor = dk ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';
          }}
        >
          <ArrowUp size={18} />
        </button>

        {/* Social row */}
        <div style={{ display: 'flex', gap: '12px' }}>
          {socials.map(({ icon: Icon, href, label }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: dk ? '#6b7280' : '#9ca3af',
                transition: 'color 0.3s',
              }}
              onMouseEnter={e => e.currentTarget.style.color = '#6366f1'}
              onMouseLeave={e => e.currentTarget.style.color = dk ? '#6b7280' : '#9ca3af'}
              aria-label={label}
            >
              <Icon size={18} />
            </a>
          ))}
        </div>

        {/* Copyright */}
        <p style={{
          fontSize: '13px',
          color: dk ? '#4b5563' : '#9ca3af',
          display: 'flex', alignItems: 'center', gap: '6px',
        }}>
          Built with <Heart size={12} style={{ color: '#ef4444' }} /> by {personalInfo.name}
        </p>
      </div>
    </footer>
  );
};

export default Footer;