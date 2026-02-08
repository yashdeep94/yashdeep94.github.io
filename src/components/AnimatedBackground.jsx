import { useTheme } from '../contexts/ThemeContext';

const symbols = ['</', '/>', '{}', '[]', '()', '=>', '&&', '||', '++', '::', '/*', '*/', '<?', '/>'];

const AnimatedBackground = () => {
  const { theme } = useTheme();
  const dk = theme === 'dark';

  return (
    <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
      {/* Gradient orbs */}
      <div
        className="animate-pulse-glow"
        style={{
          position: 'absolute', top: '10%', left: '15%',
          width: '500px', height: '500px', borderRadius: '50%',
          background: dk
            ? 'radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)'
            : 'radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)',
          filter: 'blur(60px)',
        }}
      />
      <div
        className="animate-pulse-glow"
        style={{
          position: 'absolute', bottom: '10%', right: '10%',
          width: '400px', height: '400px', borderRadius: '50%',
          background: dk
            ? 'radial-gradient(circle, rgba(139,92,246,0.1) 0%, transparent 70%)'
            : 'radial-gradient(circle, rgba(139,92,246,0.06) 0%, transparent 70%)',
          filter: 'blur(60px)',
          animationDelay: '2s',
        }}
      />
      <div
        className="animate-blob"
        style={{
          position: 'absolute', top: '50%', left: '50%',
          width: '300px', height: '300px',
          background: dk
            ? 'radial-gradient(circle, rgba(236,72,153,0.06) 0%, transparent 70%)'
            : 'radial-gradient(circle, rgba(236,72,153,0.04) 0%, transparent 70%)',
          filter: 'blur(50px)',
          transform: 'translate(-50%, -50%)',
        }}
      />

      {/* Floating code symbols */}
      {symbols.map((s, i) => (
        <span
          key={i}
          className="animate-float-slow"
          style={{
            position: 'absolute',
            left: `${5 + (i * 7) % 90}%`,
            top: `${10 + (i * 13) % 80}%`,
            fontSize: `${12 + (i % 4) * 4}px`,
            fontFamily: "'Fira Code', 'JetBrains Mono', monospace",
            color: dk ? 'rgba(99,102,241,0.08)' : 'rgba(99,102,241,0.06)',
            fontWeight: 600,
            animationDelay: `${i * 0.7}s`,
            animationDuration: `${6 + (i % 5) * 2}s`,
            userSelect: 'none',
          }}
        >
          {s}
        </span>
      ))}

      {/* Grid pattern */}
      <div
        style={{
          position: 'absolute', inset: 0,
          backgroundImage: dk
            ? 'linear-gradient(rgba(99,102,241,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.03) 1px, transparent 1px)'
            : 'linear-gradient(rgba(99,102,241,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.02) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />
    </div>
  );
};

export default AnimatedBackground;