import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const ALL_TOPICS = [
  { id: 'technology', label: 'Technology', emoji: '💻' },
  { id: 'science', label: 'Science', emoji: '🔬' },
  { id: 'business', label: 'Business', emoji: '📈' },
  { id: 'health', label: 'Health', emoji: '🧬' },
  { id: 'sports', label: 'Sports', emoji: '⚡' },
  { id: 'entertainment', label: 'Entertainment', emoji: '🎬' },
  { id: 'politics', label: 'Politics', emoji: '🌐' },
  { id: 'world', label: 'World', emoji: '🗺️' },
  { id: 'environment', label: 'Environment', emoji: '🌿' },
];

const Onboarding = () => {
  const [selected, setSelected] = useState<string[]>(['technology', 'science']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { token } = useAuth();
  const navigate = useNavigate();

  const toggle = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  };

  const handleContinue = async () => {
    if (selected.length === 0) {
      setError('Pick at least one topic');
      return;
    }
    setLoading(true);
    try {
      await axios.put(
        'http://localhost:8000/auth/topics',
        { topics: selected },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      navigate('/feed');
    } catch {
      // even if update fails, go to feed with default topics
      navigate('/feed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.logo}>PULSE</div>
          <h1 style={styles.title}>What moves you?</h1>
          <p style={styles.subtitle}>
            Pick your topics and we'll build your perfect feed.
            You can always change these later.
          </p>
        </div>

        {/* Topic Grid */}
        <div style={styles.grid}>
          {ALL_TOPICS.map((topic, i) => (
            <button
              key={topic.id}
              onClick={() => toggle(topic.id)}
              style={{
                ...styles.topicBtn,
                ...(selected.includes(topic.id) ? styles.topicBtnActive : {}),
                animationDelay: `${i * 0.06}s`,
              }}
            >
              <span style={styles.emoji}>{topic.emoji}</span>
              <span style={styles.topicLabel}>{topic.label}</span>
              {selected.includes(topic.id) && (
                <span style={styles.checkmark}>✓</span>
              )}
            </button>
          ))}
        </div>

        {error && <p style={styles.error}>{error}</p>}

        {/* Footer */}
        <div style={styles.footer}>
          <p style={styles.selectedCount}>
            {selected.length} topic{selected.length !== 1 ? 's' : ''} selected
          </p>
          <button
            onClick={handleContinue}
            disabled={loading || selected.length === 0}
            style={{
              ...styles.continueBtn,
              opacity: selected.length === 0 ? 0.5 : 1,
            }}
          >
            {loading ? 'Setting up...' : 'Build My Feed →'}
          </button>
        </div>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh',
    backgroundColor: 'var(--bg-primary)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 20px',
  },
  content: {
    width: '100%',
    maxWidth: '640px',
    animation: 'fadeIn 0.6s ease forwards',
  },
  header: {
    textAlign: 'center',
    marginBottom: '56px',
  },
  logo: {
    fontFamily: 'var(--font-display)',
    fontSize: '0.9rem',
    fontWeight: 700,
    letterSpacing: '0.4em',
    color: 'var(--accent)',
    marginBottom: '32px',
  },
  title: {
    fontFamily: 'var(--font-display)',
    fontSize: '3rem',
    fontWeight: 900,
    color: 'var(--text-primary)',
    marginBottom: '16px',
  },
  subtitle: {
    fontSize: '1rem',
    color: 'var(--text-secondary)',
    lineHeight: 1.7,
    maxWidth: '400px',
    margin: '0 auto',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '12px',
    marginBottom: '48px',
  },
  topicBtn: {
    backgroundColor: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-lg)',
    padding: '20px 16px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
    cursor: 'pointer',
    transition: 'var(--transition)',
    position: 'relative',
    animation: 'fadeIn 0.4s ease forwards',
    opacity: 0,
  },
  topicBtnActive: {
    backgroundColor: 'var(--accent-dim)',
    borderColor: 'var(--accent)',
  },
  emoji: {
    fontSize: '1.8rem',
  },
  topicLabel: {
    fontSize: '0.85rem',
    fontWeight: 500,
    color: 'var(--text-primary)',
    letterSpacing: '0.02em',
  },
  checkmark: {
    position: 'absolute',
    top: '10px',
    right: '12px',
    color: 'var(--accent)',
    fontSize: '0.75rem',
    fontWeight: 700,
  },
  error: {
    color: '#e05555',
    fontSize: '0.85rem',
    textAlign: 'center',
    marginBottom: '16px',
  },
  footer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTop: '1px solid var(--border)',
    paddingTop: '32px',
  },
  selectedCount: {
    fontSize: '0.85rem',
    color: 'var(--text-secondary)',
  },
  continueBtn: {
    backgroundColor: 'var(--accent)',
    color: '#0a0a0a',
    padding: '14px 28px',
    borderRadius: 'var(--radius)',
    fontSize: '0.9rem',
    fontWeight: 600,
    letterSpacing: '0.05em',
    transition: 'var(--transition)',
    cursor: 'pointer',
    border: 'none',
  },
};

export default Onboarding;