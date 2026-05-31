import { useState } from 'react';
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

interface Props {
  currentTopics: string[];
  onClose: () => void;
}

const TopicsModal = ({ currentTopics, onClose }: Props) => {
  const [selected, setSelected] = useState<string[]>(currentTopics);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { token } = useAuth();

  const toggle = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  };

  const handleSave = async () => {
    if (selected.length === 0) return;
    setLoading(true);
    try {
      await axios.put(
        'http://localhost:8000/auth/topics',
        { topics: selected },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccess(true);
      setTimeout(() => {
        onClose();
        window.location.reload(); // reload feed with new topics
      }, 1000);
    } catch (err) {
      console.error('Failed to update topics', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={styles.header}>
          <div>
            <h2 style={styles.title}>Your Topics</h2>
            <p style={styles.subtitle}>Select what you want to read about</p>
          </div>
          <button onClick={onClose} style={styles.closeBtn}>✕</button>
        </div>

        {/* Topic Grid */}
        <div style={styles.grid}>
          {ALL_TOPICS.map((topic) => (
            <button
              key={topic.id}
              onClick={() => toggle(topic.id)}
              style={{
                ...styles.topicBtn,
                ...(selected.includes(topic.id) ? styles.topicBtnActive : {}),
              }}
            >
              <span style={styles.emoji}>{topic.emoji}</span>
              <span style={styles.label}>{topic.label}</span>
              {selected.includes(topic.id) && (
                <span style={styles.check}>✓</span>
              )}
            </button>
          ))}
        </div>

        {/* Footer */}
        <div style={styles.footer}>
          <span style={styles.count}>
            {selected.length} topic{selected.length !== 1 ? 's' : ''} selected
          </span>
          <div style={styles.footerBtns}>
            <button onClick={onClose} style={styles.cancelBtn}>Cancel</button>
            <button
              onClick={handleSave}
              disabled={loading || selected.length === 0}
              style={{
                ...styles.saveBtn,
                opacity: selected.length === 0 ? 0.5 : 1,
              }}
            >
              {success ? '✓ Saved!' : loading ? 'Saving...' : 'Save Topics'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles: Record<string, any> = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    backgroundColor: 'rgba(0,0,0,0.7)',
    backdropFilter: 'blur(4px)',
    zIndex: 200,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    animation: 'fadeIn 0.2s ease forwards',
  },
  modal: {
    backgroundColor: 'var(--bg-secondary)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-lg)',
    width: '100%',
    maxWidth: '560px',
    padding: '32px',
    animation: 'fadeIn 0.3s ease forwards',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '28px',
  },
  title: {
    fontFamily: 'var(--font-display)',
    fontSize: '1.5rem',
    fontWeight: 700,
    color: 'var(--text-primary)',
    marginBottom: '4px',
  },
  subtitle: {
    fontSize: '0.85rem',
    color: 'var(--text-secondary)',
  },
  closeBtn: {
    backgroundColor: 'transparent',
    border: 'none',
    color: 'var(--text-muted)',
    fontSize: '1rem',
    cursor: 'pointer',
    padding: '4px',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '10px',
    marginBottom: '28px',
  },
  topicBtn: {
    backgroundColor: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-lg)',
    padding: '16px 12px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '6px',
    cursor: 'pointer',
    transition: 'var(--transition)',
    position: 'relative',
    fontFamily: 'var(--font-body)',
  },
  topicBtnActive: {
    backgroundColor: 'var(--accent-dim)',
    borderColor: 'var(--accent)',
  },
  emoji: {
    fontSize: '1.5rem',
  },
  label: {
    fontSize: '0.8rem',
    fontWeight: 500,
    color: 'var(--text-primary)',
  },
  check: {
    position: 'absolute',
    top: '8px',
    right: '10px',
    color: 'var(--accent)',
    fontSize: '0.7rem',
    fontWeight: 700,
  },
  footer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: '20px',
    borderTop: '1px solid var(--border)',
  },
  count: {
    fontSize: '0.82rem',
    color: 'var(--text-secondary)',
  },
  footerBtns: {
    display: 'flex',
    gap: '10px',
  },
  cancelBtn: {
    backgroundColor: 'transparent',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius)',
    padding: '9px 18px',
    fontSize: '0.85rem',
    color: 'var(--text-secondary)',
    cursor: 'pointer',
    fontFamily: 'var(--font-body)',
  },
  saveBtn: {
    backgroundColor: 'var(--accent)',
    border: 'none',
    borderRadius: 'var(--radius)',
    padding: '9px 18px',
    fontSize: '0.85rem',
    fontWeight: 600,
    color: '#0a0a0a',
    cursor: 'pointer',
    fontFamily: 'var(--font-body)',
    transition: 'var(--transition)',
  },
};

export default TopicsModal;