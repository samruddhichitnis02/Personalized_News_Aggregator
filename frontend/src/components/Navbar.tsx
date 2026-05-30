import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav style={styles.nav}>
      <div style={styles.inner}>
        {/* Logo */}
        <Link to="/feed" style={styles.logo}>PULSE</Link>

        {/* Nav Links */}
        <div style={styles.links}>
          <Link
            to="/feed"
            style={{
              ...styles.link,
              ...(isActive('/feed') ? styles.linkActive : {}),
            }}
          >
            Feed
          </Link>
          <Link
            to="/bookmarks"
            style={{
              ...styles.link,
              ...(isActive('/bookmarks') ? styles.linkActive : {}),
            }}
          >
            Bookmarks
          </Link>
        </div>

        {/* Right side */}
        <div style={styles.right}>
          <span style={styles.email}>{user?.email}</span>
          <button onClick={logout} style={styles.logoutBtn}>
            Sign out
          </button>
        </div>
      </div>
    </nav>
  );
};

const styles: Record<string, React.CSSProperties> = {
  nav: {
    position: 'sticky',
    top: 0,
    zIndex: 100,
    backgroundColor: 'rgba(10, 10, 10, 0.92)',
    backdropFilter: 'blur(12px)',
    borderBottom: '1px solid var(--border)',
  },
  inner: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 40px',
    height: '64px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logo: {
    fontFamily: 'var(--font-display)',
    fontSize: '1rem',
    fontWeight: 700,
    letterSpacing: '0.4em',
    color: 'var(--accent)',
    textDecoration: 'none',
  },
  links: {
    display: 'flex',
    gap: '32px',
  },
  link: {
    fontSize: '0.85rem',
    fontWeight: 500,
    letterSpacing: '0.05em',
    color: 'var(--text-secondary)',
    textDecoration: 'none',
    transition: 'var(--transition)',
    paddingBottom: '2px',
    borderBottom: '1px solid transparent',
  },
  linkActive: {
    color: 'var(--text-primary)',
    borderBottomColor: 'var(--accent)',
  },
  right: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
  },
  email: {
    fontSize: '0.8rem',
    color: 'var(--text-muted)',
  },
  logoutBtn: {
    backgroundColor: 'transparent',
    border: '1px solid var(--border-light)',
    borderRadius: 'var(--radius)',
    padding: '7px 14px',
    fontSize: '0.8rem',
    color: 'var(--text-secondary)',
    cursor: 'pointer',
    transition: 'var(--transition)',
    fontFamily: 'var(--font-body)',
  },
};

export default Navbar;