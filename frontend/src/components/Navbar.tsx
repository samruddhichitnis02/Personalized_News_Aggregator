import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import TopicsModal from './TopicsModal';

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [showTopics, setShowTopics] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const isActive = (path: string) => location.pathname === path;

  const initials = user?.email
    ? user.email.slice(0, 2).toUpperCase()
    : '??';

  return (
    <>
      <nav style={{
        position: 'sticky', top: 0, zIndex: 100,
        backgroundColor: scrolled ? 'rgba(8,8,8,0.96)' : 'rgba(8,8,8,0.85)',
        backdropFilter: 'blur(20px)',
        borderBottom: `1px solid ${scrolled ? '#2a2a2a' : '#1a1a1a'}`,
        transition: 'all 0.3s ease',
      }}>
        <div style={{
          maxWidth: '1280px', margin: '0 auto', padding: '0 40px',
          height: '60px', display: 'flex', alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          {/* Logo */}
          <Link to="/feed" style={{
            fontFamily: 'var(--font-display)',
            fontSize: '0.95rem', fontWeight: 700,
            letterSpacing: '0.45em', color: 'var(--accent)',
            textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px',
          }}>
            <span style={{
              width: '7px', height: '7px', borderRadius: '50%',
              backgroundColor: 'var(--accent)',
              display: 'inline-block',
              boxShadow: '0 0 8px var(--accent-glow)',
            }} />
            PULSE
          </Link>

          {/* Nav Links */}
          <div style={{ display: 'flex', gap: '4px' }}>
            {[{ to: '/feed', label: 'Feed' }, { to: '/bookmarks', label: 'Bookmarks' }].map(({ to, label }) => (
              <Link key={to} to={to} style={{
                fontSize: '0.82rem', fontWeight: 500,
                letterSpacing: '0.04em',
                color: isActive(to) ? 'var(--text-primary)' : 'var(--text-secondary)',
                textDecoration: 'none',
                padding: '6px 14px', borderRadius: '6px',
                backgroundColor: isActive(to) ? 'var(--bg-hover)' : 'transparent',
                transition: 'all 0.18s ease',
                position: 'relative',
              }}
              onMouseEnter={e => { if (!isActive(to)) (e.currentTarget as HTMLElement).style.color = 'var(--text-primary)'; }}
              onMouseLeave={e => { if (!isActive(to)) (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)'; }}
              >
                {label}
                {isActive(to) && (
                  <span style={{
                    position: 'absolute', bottom: '2px', left: '50%',
                    transform: 'translateX(-50%)',
                    width: '16px', height: '2px',
                    backgroundColor: 'var(--accent)', borderRadius: '1px',
                  }} />
                )}
              </Link>
            ))}
          </div>

          {/* Right */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              onClick={() => setShowTopics(true)}
              style={{
                backgroundColor: 'var(--accent-dim)',
                border: '1px solid rgba(245,166,35,0.3)',
                borderRadius: '6px', padding: '6px 13px',
                fontSize: '0.78rem', color: 'var(--accent)',
                cursor: 'pointer', transition: 'all 0.18s ease',
                fontFamily: 'var(--font-body)', fontWeight: 500,
                letterSpacing: '0.02em', display: 'flex', alignItems: 'center', gap: '5px',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(245,166,35,0.18)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--accent-dim)'; }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M4.22 4.22l2.12 2.12M17.66 17.66l2.12 2.12M2 12h3M19 12h3M4.22 19.78l2.12-2.12M17.66 6.34l2.12-2.12"/>
              </svg>
              Topics
            </button>

            {/* Avatar dropdown */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setUserMenuOpen(o => !o)}
                style={{
                  width: '32px', height: '32px', borderRadius: '50%',
                  backgroundColor: 'var(--accent-dim)',
                  border: '1.5px solid rgba(245,166,35,0.4)',
                  color: 'var(--accent)', fontSize: '0.7rem',
                  fontWeight: 600, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.18s ease', fontFamily: 'var(--font-body)',
                  letterSpacing: '0.05em',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--accent)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(245,166,35,0.4)'; }}
              >
                {initials}
              </button>

              {userMenuOpen && (
                <div style={{
                  position: 'absolute', top: 'calc(100% + 8px)', right: 0,
                  backgroundColor: '#161616', border: '1px solid #2a2a2a',
                  borderRadius: '10px', minWidth: '200px', padding: '6px',
                  boxShadow: '0 16px 48px rgba(0,0,0,0.6)',
                  animation: 'fadeUp 0.18s ease forwards',
                  zIndex: 200,
                }}>
                  <div style={{ padding: '10px 12px 12px', borderBottom: '1px solid #222' }}>
                    <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '2px' }}>Signed in as</p>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-primary)', fontWeight: 500 }}>{user?.email}</p>
                  </div>
                  <button
                    onClick={() => { setUserMenuOpen(false); logout(); }}
                    style={{
                      width: '100%', textAlign: 'left',
                      backgroundColor: 'transparent', border: 'none',
                      padding: '9px 12px', fontSize: '0.82rem',
                      color: 'var(--text-secondary)', cursor: 'pointer',
                      borderRadius: '6px', marginTop: '4px',
                      transition: 'all 0.15s ease', display: 'flex', alignItems: 'center', gap: '8px',
                    }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--bg-hover)';
                      (e.currentTarget as HTMLElement).style.color = '#ff6b6b';
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
                      (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)';
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
                    </svg>
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {userMenuOpen && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 199 }}
          onClick={() => setUserMenuOpen(false)}
        />
      )}

      {showTopics && (
        <TopicsModal
          currentTopics={user?.topics || []}
          onClose={() => setShowTopics(false)}
        />
      )}
    </>
  );
};

export default Navbar;