import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Sun, Moon, Menu, X, Terminal } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { navLinks } from '../data/content';

const Navbar = () => {
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const dk = theme === 'dark';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => setMobileOpen(false), [location]);

  return (
    <nav
      className="glass"
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
        padding: scrolled ? '12px 0' : '20px 0',
        background: scrolled
          ? dk ? 'rgba(3,7,18,0.85)' : 'rgba(255,255,255,0.85)'
          : 'transparent',
        borderBottom: scrolled ? `1px solid ${dk ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}` : 'none',
        transition: 'all 0.4s ease',
      }}
    >
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {/* Logo */}
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '10px',
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 20px rgba(99,102,241,0.3)',
          }}>
            <Terminal size={18} color="white" />
          </div>
          <span style={{
            fontSize: '18px', fontWeight: 700, letterSpacing: '-0.5px',
            color: dk ? '#fff' : '#111827',
          }}>
            YD<span style={{ color: '#6366f1' }}>.</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div className="hidden md:flex" style={{ alignItems: 'center', gap: '4px' }}>
            {navLinks.map(link => {
              const active = location.pathname === link.path;
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className="magnetic-btn"
                  style={{
                    padding: '8px 18px', borderRadius: '10px', textDecoration: 'none',
                    fontSize: '14px', fontWeight: 500, letterSpacing: '0.3px',
                    color: active ? '#fff' : dk ? '#9ca3af' : '#6b7280',
                    background: active ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : 'transparent',
                    boxShadow: active ? '0 4px 15px rgba(99,102,241,0.3)' : 'none',
                    transition: 'all 0.3s ease',
                  }}
                >
                  {link.name}
                </Link>
              );
            })}
          </div>

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="magnetic-btn"
            style={{
              width: '40px', height: '40px', borderRadius: '12px',
              border: `1px solid ${dk ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
              background: dk ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: dk ? '#fbbf24' : '#6366f1',
              cursor: 'pointer', transition: 'all 0.3s ease',
            }}
          >
            {dk ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {/* Mobile menu btn */}
          <button
            className="md:hidden mobile-only flex"
            onClick={() => setMobileOpen(!mobileOpen)}
            style={{
              width: '40px', height: '40px', borderRadius: '12px',
              border: `1px solid ${dk ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
              background: dk ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: dk ? '#d1d5db' : '#374151',
              cursor: 'pointer',
            }}
          >
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div
          className="md:hidden mobile-only flex flex-col glass animate-fade-up"
          style={{
            margin: '12px 16px 0', padding: '16px', borderRadius: '16px',
            border: `1px solid ${dk ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
            background: dk ? 'rgba(3,7,18,0.95)' : 'rgba(255,255,255,0.95)',
            gap: '4px',
          }}
        >
          {navLinks.map(link => {
            const active = location.pathname === link.path;
            return (
              <Link
                key={link.name}
                to={link.path}
                style={{
                  padding: '12px 16px', borderRadius: '12px', textDecoration: 'none',
                  fontSize: '15px', fontWeight: 500,
                  color: active ? '#fff' : dk ? '#9ca3af' : '#6b7280',
                  background: active ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : 'transparent',
                }}
              >
                {link.name}
              </Link>
            );
          })}
        </div>
      )}
    </nav>
  );
};

export default Navbar;