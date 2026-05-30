import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register as registerApi } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await registerApi(email, password, ['technology', 'science']);
      login(res.data.access_token);
      navigate('/onboarding');
    } catch {
      setError('Email already registered or invalid');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      {/* Left Panel */}
      <div style={styles.leftPanel}>
        <div style={styles.leftContent}>
          <div style={styles.logo}>PULSE</div>
          <h1 style={styles.tagline}>Stay ahead<br />of the<br /><em>curve.</em></h1>
          <p style={styles.subTagline}>
            Join thousands who get their news smarter, faster, and more personally.
          </p>
          <div style={styles.decorLine} />
        </div>
        <div style={styles.leftFooter}>
          The news, distilled.
        </div>
      </div>

      {/* Right Panel */}
      <div style={styles.rightPanel}>
        <div style={styles.formWrapper}>
          <div style={styles.formHeader}>
            <h2 style={styles.formTitle}>Create account</h2>
            <p style={styles.formSubtitle}>Start your personalized feed</p>
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
                onFocus={(e) => e.target.style.borderColor = 'var(--accent)'}
                onBlur={(e) => e.target.style.borderColor = 'var(--border-light)'}
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
                onFocus={(e) => e.target.style.borderColor = 'var(--accent)'}
                onBlur={(e) => e.target.style.borderColor = 'var(--border-light)'}
              />
            </div>

            {error && <p style={styles.error}>{error}</p>}

            <button type="submit" disabled={loading} style={styles.button}>
              {loading ? 'Creating account...' : 'Create Account →'}
            </button>
          </form>

          <p style={styles.switchText}>
            Already have an account?{' '}
            <Link to="/login" style={styles.link}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    minHeight: '100vh',
    backgroundColor: 'var(--bg-primary)',
  },
  leftPanel: {
    width: '45%',
    backgroundColor: 'var(--bg-secondary)',
    borderRight: '1px solid var(--border)',
    padding: '60px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    position: 'relative',
    overflow: 'hidden',
  },
  leftContent: {
    animation: 'fadeInLeft 0.6s ease forwards',
  },
  logo: {
    fontFamily: 'var(--font-display)',
    fontSize: '1rem',
    fontWeight: 700,
    letterSpacing: '0.4em',
    color: 'var(--accent)',
    marginBottom: '80px',
  },
  tagline: {
    fontFamily: 'var(--font-display)',
    fontSize: '3.5rem',
    fontWeight: 900,
    lineHeight: 1.15,
    color: 'var(--text-primary)',
    marginBottom: '24px',
  },
  subTagline: {
    fontSize: '1rem',
    color: 'var(--text-secondary)',
    lineHeight: 1.7,
    maxWidth: '280px',
    marginBottom: '40px',
  },
  decorLine: {
    width: '60px',
    height: '2px',
    backgroundColor: 'var(--accent)',
  },
  leftFooter: {
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
    letterSpacing: '0.15em',
    textTransform: 'uppercase',
  },
  rightPanel: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '60px',
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
    fontSize: '0.75rem'