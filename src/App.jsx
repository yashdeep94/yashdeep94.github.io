import { useEffect } from 'react';
import { HashRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import AnimatedBackground from './components/AnimatedBackground';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Apps from './pages/Apps';

// Route changes must reset scroll position. Navigating from a scrolled Home to /apps was
// landing the visitor at y=695: past the heading, in the middle of the card grid.
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
};

const AppContent = () => {
  const { theme } = useTheme();
  const dk = theme === 'dark';

  return (
    <Router>
      <div
        className="noise-bg"
        style={{
          minHeight: '100vh',
          background: dk
            ? 'linear-gradient(135deg, #030712 0%, #0a0f1a 50%, #030712 100%)'
            : 'linear-gradient(135deg, #f8fafc 0%, #f0f4ff 50%, #f8fafc 100%)',
          color: dk ? '#e5e7eb' : '#1f2937',
          transition: 'background 0.4s ease',
        }}
      >
        <AnimatedBackground />
        <Navbar />
        <main>
          <ScrollToTop />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/apps" element={<Apps />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
};

const App = () => (
  <ThemeProvider>
    <AppContent />
  </ThemeProvider>
);

export default App;