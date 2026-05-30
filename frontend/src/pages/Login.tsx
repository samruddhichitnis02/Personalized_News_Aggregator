import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login as loginApi } from '../services/api';
import { useAuth } from '../context/AuthContext';

const HEADLINES = [
  "Global markets react to latest economic data",
  "Scientists discover breakthrough in renewable energy",
  "World leaders gather for climate summit",
  "Tech giants announce major AI investments",
  "Space agencies plan next lunar mission",
  "Record temperatures recorded across continents",
];

// Free high quality news-themed images from Unsplash
const BG_IMAGES = [
  "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=1200&q=80",
  "https://images.unsplash.com/photo-1495020689067-958852a7765e?w=1200&q=80",
  "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1200&q=80",
  "https://images.unsplash.com/photo-1526378722484-bd91ca387e72?w=1200&q=80",
  "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=1200&q=80",
];

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentHeadline, setCurrentHeadline] = useState(0);
  const [headlineVisible, setHeadlineVisible] = useState(true);
  const [currentBg, setCurrentBg] = useState(0);
  const [bgVisible, setBgVisible] = useState(true);
  const { login } = useAuth();
  const navigate = useNavigate();

  // cycle background images every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setBgVisible(false);
      setTimeout(() => {
        setCurrentBg((prev) => (prev + 1) % BG_IMAGES.length);
        setBgVisible(true);
      }, 800);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // cycle headlines every 3.5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setHeadlineVisible(false);
      setTimeout(() => {
        setCurrentHeadline((prev) => (prev + 1) % HEADLINES.length);
        setHeadlineVisible(true);
      }, 500);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await loginApi(email, password);
      login(res.data.access_token);
      navigate('/feed');
    } catch {
      setError('Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      {/* Left Panel */}
      <div style={styles.leftPanel}>

        {/* Background image slideshow */}
        <div
          style={{
            ...styles.bgImage,
            backgroundImage: `url(${BG_IMAGES[currentBg]})`,
            opacity: bgVisible ? 1 : 0,
          }}
        />

        {/* Dark overlay */}
        <div style={styles.overlay} />

        {/* Gradient overlay bottom */}
        <div style={styles.gradientOverlay} />

        {/* Content */}
        <div style={styles.leftContent}>
          {/* Logo + Live */}
          <div style={styles.topRow}>
            <div style={styles.logo}>PULSE</div>
            <div style={styles.liveBar}>
              <span style={styles.liveDot} />
              <span style={styles.liveText}>LIVE</span>
            </div>
          </div>

          {/* Breaking headline */}
          <div style={styles.headlineBox}>
            <p style={styles.headlineLabel}>BREAKING NOW</p>
            <h2
              style={{
                ...styles.headline,
                opacity: headlineVisible ? 1 : 0,
                transform: headlineVisible ? 'translateY(0)' : 'translateY(12px)',
              }}
            >
              {HEADLINES[currentHeadline]}
            </h2>
          </div>

          {/* Tagline */}
          <div style={styles.taglineBox}>
            <h1 style={styles.tagline}>Your world,<br /><em>curated.</em></h1>
            <p style={styles.subTagline}>
              Personalized news from the sources that matter to you.
            </p>
            <div style={styles.decorLine} />
          </div>
        </div>

        {/* Image indicator dots */}
        <div style={styles.dots}>
          {BG_IMAGES.map((_, i) => (
            <div
              key={i}
              onClick={() => setCurrentBg(i)}
              style={{
                ...styles.dot,
                ...(i === currentBg ? styles.dotActive : {}),
              }}
            />
          ))}
        </div>

        {/* Ticker bar */}
        <div style={styles.tickerBar}>
          <span style={styles.tickerLabel}>PULSE</span>
          <div style={styles.tickerTrack}>
            <div style={styles.tickerContent}>
              {[...HEADLINES, ...HEADLINES].map((h, i) => (
                <span key={i} style={styles.tickerItem}>
                  {h}
                  <span style={styles.tickerSep}>◆</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div style={styles.rightPanel}>
        <div style={styles.formWrapper}>
          <div style={styles.formHeader}>
            <h2 style={styles.formTitle}>Welcome back</h2>
            <p style={styles.formSubtitle}>Sign in to your feed</p>
          </div>

          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                style={styles.input}
                onFocus={(e) => (e.target.style.borderColor = 'var(--accent)')}
                onBlur={(e) => (e.target.style.borderColor = 'var(--border-light)')}
              />
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                style={styles.input}
                onFocus={(e) => (e.target.style.borderColor = 'var(--accent)')}
                onBlur={(e) => (e.target.style.borderColor = 'var(--border-light)')}
              />
            </div>

            {error && <p style={styles.error}>{error}</p>}

            <button type="submit" disabled={loading} style={styles.button}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p style={styles.switchText}>
            Don't have an account?{' '}
            <Link to="/register" style={styles.link}>Create one</Link>
          </p>
        </div>
      </div>

      <style>{`
        @keyframes ticker {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes pulseDot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.3; transform: scale(0.7); }
        }
      `}</style>
    </div>
  );
};

const styles: Record<string, any> = {
  container: {
    display: 'flex',
    minHeight: '100vh',
    backgroundColor: 'var(--bg-primary)',
  },
  leftPanel: {
    width: '52%',
    position: 'relative',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    minHeight: '100vh',
  },
  bgImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    transition: 'opacity 0.8s ease',
    zIndex: 0,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0,0,0,0.65)',
    zIndex: 1,
  },
  gradientOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: '100%',
    height: '50%',
    background: 'linear-gradient(to top, rgba(0,0,0,0.98), transparent)',
    zIndex: 2,
  },
  leftContent: {
    position: 'relative',
    zIndex: 3,
    padding: '48px',
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    paddingBottom: '80px',
  },
  topRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  logo: {
    fontFamily: 'var(--font-display)',
    fontSize: '1rem',
    fontWeight: 700,
    letterSpacing: '0.4em',
    color: 'var(--accent)',
  },
  liveBar: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    backgroundColor: 'rgba(224,85,85,0.15)',
    border: '1px solid rgba(224,85,85,0.3)',
    borderRadius: '100px',
    padding: '3px 10px',
  },
  liveDot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    backgroundColor: '#e05555',
    display: 'inline-block',
    animation: 'pulseDot 1.2s ease infinite',
  },
  liveText: {
    fontSize: '0.65rem',
    fontWeight: 700,
    letterSpacing: '0.2em',
    color: '#e05555',
  },
  headlineBox: {
    marginTop: 'auto',
    paddingTop: '40px',
  },
  headlineLabel: {
    fontSize: '0.65rem',
    fontWeight: 700,
    letterSpacing: '0.2em',
    color: 'var(--accent)',
    marginBottom: '12px',
  },
  headline: {
    fontFamily: 'var(--font-display)',
    fontSize: '1.6rem',
    fontWeight: 700,
    lineHeight: 1.35,
    color: '#ffffff',
    transition: 'opacity 0.5s ease, transform 0.5s ease',
    maxWidth: '400px',
  },
  taglineBox: {
    marginTop: '40px',
    paddingTop: '28px',
    borderTop: '1px solid rgba(255,255,255,0.12)',
  },
  tagline: {
    fontFamily: 'var(--font-display)',
    fontSize: '2.6rem',
    fontWeight: 900,
    lineHeight: 1.15,
    color: '#ffffff',
    marginBottom: '14px',
  },
  subTagline: {
    fontSize: '0.88rem',
    color: 'rgba(255,255,255,0.5)',
    lineHeight: 1.7,
    maxWidth: '280px',
    marginBottom: '20px',
  },
  decorLine: {
    width: '40px',
    height: '2px',
    backgroundColor: 'var(--accent)',
  },
  dots: {
    position: 'absolute',
    bottom: '52px',
    right: '24px',
    zIndex: 4,
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  dot: {
    width: '4px',
    height: '4px',
    borderRadius: '50%',
    backgroundColor: 'rgba(255,255,255,0.3)',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },
  dotActive: {
    backgroundColor: 'var(--accent)',
    height: '16px',
    borderRadius: '2px',
  },
  tickerBar: {
    position: 'relative',
    zIndex: 3,
    display: 'flex',
    alignItems: 'center',
    backgroundColor: 'var(--accent)',
    height: '36px',
    overflow: 'hidden',
    flexShrink: 0,
  },
  tickerLabel: {
    flexShrink: 0,
    backgroundColor: '#0a0a0a',
    color: 'var(--accent)',
    fontFamily: 'var(--font-display)',
    fontSize: '0.7rem',
    fontWeight: 700,
    letterSpacing: '0.15em',
    padding: '0 16px',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
  },
  tickerTrack: {
    flex: 1,
    overflow: 'hidden',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
  },
  tickerContent: {
    display: 'flex',
    alignItems: 'center',
    whiteSpace: 'nowrap',
    animation: 'ticker 28s linear infinite',
  },
  tickerItem: {
    fontSize: '0.75rem',
    fontWeight: 600,
    color: '#0a0a0a',
    paddingRight: '8px',
  },
  tickerSep: {
    margin: '0 16px',
    fontSize: '0.5rem',
    color: 'rgba(0,0,0,0.35)',
  },
  rightPanel: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '60px',
    backgroundColor: 'var(--bg-primary)',
  },
  formWrapper: {
    width: '100%',
    maxWidth: '380px',
    animation: 'fadeIn 0.6s ease forwards',
  },
  formHeader: {
    marginBottom: '40px',
  },
  formTitle: {
    fontFamily: 'var(--font-display)',
    fontSize: '2rem',
    fontWeight: 700,
    color: 'var(--text-primary)',
    marginBottom: '8px',
  },
  formSubtitle: {
    fontSize: '0.9rem',
    color: 'var(--text-secondary)',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
    marginBottom: '32px',
  },
  fieldGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  label: {
    fontSize: '0.75rem',
    fontWeight: 600,
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    color: 'var(--text-secondary)',
  },
  input: {
    backgroundColor: 'var(--bg-card)',
    border: '1px solid var(--border-light)',
    borderRadius: 'var(--radius)',
    padding: '14px 16px',
    fontSize: '0.95rem',
    color: 'var(--text-primary)',
    transition: 'var(--transition)',
    width: '100%',
  },
  error: {
    color: '#e05555',
    fontSize: '0.85rem',
    padding: '10px 14px',
    backgroundColor: 'rgba(224, 85, 85, 0.1)',
    borderRadius: 'var(--radius)',
    border: '1px solid rgba(224, 85, 85, 0.2)',
  },
  button: {
    backgroundColor: 'var(--accent)',
    color: '#0a0a0a',
    padding: '14px',
    borderRadius: 'var(--radius)',
    fontSize: '0.9rem',
    fontWeight: 600,
    letterSpacing: '0.05em',
    transition: 'var(--transition)',
    marginTop: '8px',
    width: '100%',
    cursor: 'pointer',
    border: 'none',
  },
  switchText: {
    textAlign: 'center',
    fontSize: '0.85rem',
    color: 'var(--text-secondary)',
  },
  link: {
    color: 'var(--accent)',
    fontWeight: 500,
  },
};

export default Login;