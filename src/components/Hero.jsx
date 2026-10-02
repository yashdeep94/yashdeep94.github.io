import { useState, useEffect } from 'react';
import { Github, Linkedin, Mail, ChevronDown, MapPin } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { personalInfo } from '../data/content';
import profilePhoto from '../assets/images/portfolio_img.webp';

/* ===== Typing Effect ===== */
const TypingText = ({ texts }) => {
  const [idx, setIdx] = useState(0);
  const [text, setText] = useState('');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const cur = texts[idx];
    const t = setTimeout(() => {
      if (!deleting) {
        if (text.length < cur.length) setText(cur.slice(0, text.length + 1));
        else setTimeout(() => setDeleting(true), 2000);
      } else {
        if (text.length > 0) setText(text.slice(0, -1));
        else { setDeleting(false); setIdx((idx + 1) % texts.length); }
      }
    }, deleting ? 40 : 80);
    return () => clearTimeout(t);
  }, [text, deleting, idx, texts]);

  return (
    <span>
      {text}
      <span style={{ animation: 'pulse 1s step-end infinite', fontWeight: 300, color: '#6366f1' }}>|</span>
    </span>
  );
};

/* ===== Orbiting Ring ===== */
const OrbitRing = ({ radius, duration, dk }) => (
  <div style={{
    position: 'absolute', inset: 0,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    pointerEvents: 'none',
  }}>
    <div
      className="animate-spin-slow"
      style={{
        width: `${radius * 2}px`, height: `${radius * 2}px`,
        borderRadius: '50%',
        border: `1px dashed ${dk ? 'rgba(99,102,241,0.15)' : 'rgba(99,102,241,0.1)'}`,
        animationDuration: `${duration}s`,
        position: 'relative',
      }}
    >
      <div style={{
        position: 'absolute', top: 0, left: '50%',
        width: '8px', height: '8px', borderRadius: '50%',
        background: '#6366f1',
        transform: 'translate(-50%, -50%)',
        boxShadow: '0 0 12px rgba(99,102,241,0.5)',
      }} />
    </div>
  </div>
);

/* ===== Main Hero ===== */
const Hero = () => {
  const { theme } = useTheme();
  const dk = theme === 'dark';
  const [visible, setVisible] = useState(false);

  useEffect(() => { setVisible(true); }, []);

  const socials = [
    { icon: Github, href: personalInfo.github, label: 'GitHub', color: '#6366f1' },
    { icon: Linkedin, href: personalInfo.linkedin, label: 'LinkedIn', color: '#0A66C2' },
    { icon: Mail, href: `mailto:${personalInfo.email}`, label: 'Email', color: '#ec4899' },
  ];

  const scrollToNext = () => {
    window.scrollTo({ top: window.innerHeight, behavior: 'smooth' });
  };

  return (
    <section style={{
      height: '100svh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      position: 'relative', overflow: 'hidden',
      padding: '56px 20px 36px',
    }}>
      <div style={{
        maxWidth: '800px', width: '100%',
        textAlign: 'center', position: 'relative', zIndex: 1,
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        gap: 'clamp(6px, 1.3vh, 14px)',
      }}>

        {/* Photo with orbiting rings */}
        <div
          className={visible ? 'animate-scale-in' : ''}
          style={{
            position: 'relative',
            width: 'clamp(140px, 22vh, 200px)',
            height: 'clamp(140px, 22vh, 200px)',
            opacity: visible ? 1 : 0,
            flexShrink: 0,
          }}
        >
          <OrbitRing radius={Math.min(70, window.innerWidth < 640 ? 55 : 70)} duration={25} dk={dk} />
          <OrbitRing radius={Math.min(85, window.innerWidth < 640 ? 68 : 85)} duration={35} dk={dk} />

          {/* Profile photo */}
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {/* 
              Replace the src below with your actual photo path:
              - Put photo in public/ folder: src="/photo.jpg"
              - Or import it: import photo from '../assets/photo.jpg'
            */}
            <img
              src={profilePhoto}
              alt={personalInfo.name}
              style={{
                width: 'clamp(80px, 12vh, 110px)',
                height: 'clamp(80px, 12vh, 110px)',
                borderRadius: '50%',
                objectFit: 'cover',
                border: '3px solid rgba(99,102,241,0.3)',
                boxShadow: '0 0 40px rgba(99,102,241,0.2), 0 0 80px rgba(99,102,241,0.08)',
              }}
              onError={(e) => {
                // Fallback to initials if photo not found
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
            {/* Fallback initials (hidden by default) */}
            <div style={{
              display: 'none',
              width: 'clamp(80px, 12vh, 110px)',
              height: 'clamp(80px, 12vh, 110px)',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6, #a78bfa)',
              alignItems: 'center', justifyContent: 'center',
              fontSize: 'clamp(32px, 5vh, 48px)', fontWeight: 700, color: 'white',
              boxShadow: '0 0 50px rgba(99,102,241,0.25), 0 0 100px rgba(99,102,241,0.1)',
              border: '3px solid rgba(255,255,255,0.1)',
            }}>
              YD
            </div>
          </div>
        </div>

        {/* Welcome badge */}
        <div
          className={visible ? 'animate-fade-up fill-both delay-200' : ''}
          style={{ opacity: 0 }}
        >
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            padding: '6px 16px', borderRadius: '50px',
            fontSize: 'clamp(10px, 1.4vw, 13px)', fontWeight: 500, letterSpacing: '1px',
            textTransform: 'uppercase',
            color: dk ? '#a78bfa' : '#6366f1',
            background: dk ? 'rgba(99,102,241,0.1)' : 'rgba(99,102,241,0.08)',
            border: `1px solid ${dk ? 'rgba(99,102,241,0.2)' : 'rgba(99,102,241,0.15)'}`,
          }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 8px #22c55e' }} />
            Available February 2027
          </span>
        </div>

        {/* Name */}
        <h1
          className={visible ? 'animate-fade-up fill-both delay-300' : ''}
          style={{
            opacity: 0,
            fontSize: 'clamp(24px, 4.5vw, 48px)', fontWeight: 800,
            lineHeight: 1.1,
            color: dk ? '#fff' : '#111827',
            letterSpacing: '-1.5px',
            margin: 0,
          }}
        >
          Hi, I'm{' '}
          <span className="gradient-text">{personalInfo.name}</span>
        </h1>

        {/* Typing role */}
        <div
          className={visible ? 'animate-fade-up fill-both delay-400' : ''}
          style={{
            opacity: 0,
            fontSize: 'clamp(14px, 2.2vw, 20px)', fontWeight: 500,
            fontFamily: "'Fira Code', 'JetBrains Mono', monospace",
            height: 'clamp(20px, 3vw, 28px)',
            color: dk ? '#a78bfa' : '#6366f1',
          }}
        >
          <TypingText texts={personalInfo.roles} />
        </div>

        {/* Bio */}
        <p
          className={visible ? 'animate-fade-up fill-both delay-500' : ''}
          style={{
            opacity: 0,
            fontSize: 'clamp(13px, 1.5vw, 16px)', lineHeight: 1.6,
            maxWidth: '520px',
            color: dk ? '#9ca3af' : '#6b7280',
            margin: 0,
            padding: '0 10px',
          }}
        >
          {personalInfo.bio}
        </p>

        {/* Location */}
        <div
          className={visible ? 'animate-fade-up fill-both delay-500' : ''}
          style={{
            opacity: 0, display: 'flex', alignItems: 'center',
            gap: '6px', fontSize: 'clamp(12px, 1.3vw, 14px)',
            color: dk ? '#6b7280' : '#6b7280',
          }}
        >
          <MapPin size={14} />
          {personalInfo.location} · open to relocation
        </div>

        {/* Social Icons */}
        <div
          className={visible ? 'animate-fade-up fill-both delay-600' : ''}
          style={{ opacity: 0, display: 'flex', gap: '10px' }}
        >
          {socials.map(({ icon: Icon, href, label, color }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="magnetic-btn glass-card"
              style={{
                width: '42px', height: '42px', borderRadius: '12px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: dk ? '#9ca3af' : '#6b7280',
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.color = color;
                e.currentTarget.style.boxShadow = `0 0 25px ${color}30`;
                e.currentTarget.style.borderColor = `${color}40`;
              }}
              onMouseLeave={e => {
                e.currentTarget.style.color = dk ? '#9ca3af' : '#6b7280';
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
              }}
              aria-label={label}
            >
              <Icon size={20} />
            </a>
          ))}
        </div>
      </div>

      {/* Scroll indicator */}
      <div style={{
        position: 'absolute', bottom: 'clamp(16px, 3vh, 32px)',
        width: '100%', display: 'flex', justifyContent: 'center',
      }}>
        <button
          onClick={scrollToNext}
          className="animate-float"
          style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
            background: 'none', border: 'none', cursor: 'pointer',
            color: dk ? '#4b5563' : '#6b7280',
            transition: 'color 0.3s',
          }}
          onMouseEnter={e => e.currentTarget.style.color = '#6366f1'}
          onMouseLeave={e => e.currentTarget.style.color = dk ? '#4b5563' : '#6b7280'}
        >
          <span style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '3px', fontWeight: 500 }}>Scroll</span>
          <ChevronDown size={18} />
        </button>
      </div>
    </section>
  );
};

export default Hero;