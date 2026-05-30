import { useState, useEffect } from 'react';
import { getBookmarks, deleteBookmark } from '../services/api';
import Navbar from '../components/Navbar';

interface Bookmark {
  id: number;
  article_url: string;
  title: string;
  description: string;
  source: string;
  image_url: string;
}

const Bookmarks = () => {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<number | null>(null);

  useEffect(() => {
    getBookmarks()
      .then((res) => setBookmarks(res.data))
      .catch((err) => console.error('Failed to load bookmarks', err))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id: number) => {
    setDeleting(id);
    try {
      await deleteBookmark(id);
      setBookmarks((prev) => prev.filter((b) => b.id !== id));
    } catch (err) {
      console.error('Delete error', err);
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div style={styles.page}>
      <Navbar />

      <main style={styles.main}>
        {/* Header */}
        <div style={styles.pageHeader}>
          <h1 style={styles.pageTitle}>Saved Stories</h1>
          <p style={styles.pageSubtitle}>
            {bookmarks.length} article{bookmarks.length !== 1 ? 's' : ''} saved
          </p>
        </div>

        {/* Loading */}
        {loading && (
          <div style={styles.list}>
            {[...Array(4)].map((_, i) => (
              <div key={i} style={styles.skeletonRow}>
                <div style={styles.skeletonLeft}>
                  <div className="skeleton" style={{ height: '12px', width: '80px', marginBottom: '10px' }} />
                  <div className="skeleton" style={{ height: '22px', width: '100%', marginBottom: '8px' }} />
                  <div className="skeleton" style={{ height: '16px', width: '70%' }} />
                </div>
                <div className="skeleton" style={styles.skeletonThumb} />
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && bookmarks.length === 0 && (
          <div style={styles.empty}>
            <div style={styles.emptyIcon}>☆</div>
            <h3 style={styles.emptyTitle}>No saved stories yet</h3>
            <p style={styles.emptyText}>
              Bookmark articles from your feed and they'll appear here.
            </p>
          </div>
        )}

        {/* Bookmarks List */}
        {!loading && bookmarks.length > 0 && (
          <div style={styles.list}>
            {bookmarks.map((bookmark, i) => (
              <article
                key={bookmark.id}
                style={{
                  ...styles.row,
                  animationDelay: `${i * 0.06}s`,
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--bg-hover)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--bg-card)';
                }}
              >
                {/* Content */}
                <div style={styles.rowContent}>
                  <div style={styles.rowMeta}>
                    {bookmark.source && (
                      <span style={styles.source}>{bookmark.source}</span>
                    )}
                  </div>

                  
                    href={bookmark.article_url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <h2 style={styles.rowTitle}>{bookmark.title}</h2>
                  </a>

                  {bookmark.description && (
                    <p style={styles.rowDescription}>{bookmark.description}</p>
                  )}

                  <div style={styles.rowFooter}>
                    
                      href={bookmark.article_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={styles.readLink}
                    >
                      Read story →
                    </a>
                    <button
                      onClick={() => handleDelete(bookmark.id)}
                      disabled={deleting === bookmark.id}
                      style={styles.deleteBtn}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLElement).style.color = '#e05555';
                        (e.currentTarget as HTMLElement).style.borderColor = '#e05555';
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)';
                        (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)';
                      }}
                    >
                      {deleting === bookmark.id ? '...' : 'Remove'}
                    </button>
                  </div>
                </div>

                {/* Thumbnail */}
                {bookmark.image_url && (
                  <div style={styles.thumb}>
                    <img
                      src={bookmark.image_url}
                      alt={bookmark.title}
                      style={styles.thumbImg}
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>
                )}
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
    backgroundColor: 'var(--bg-primary)',
  },
  main: {
    maxWidth: '900px',
    margin: '0 auto',
    padding: '48px 40px',
  },
  pageHeader: {
    marginBottom: '40px',
    paddingBottom: '24px',
    borderBottom: '1px solid var(--border)',
    animation: 'fadeIn 0.5s ease forwards',
  },
  pageTitle: {
    fontFamily: 'var(--font-display)',
    fontSize: '2.5rem',
    fontWeight: 900,
    color: 'var(--text-primary)',
    marginBottom: '8px',
  },
  pageSubtitle: {
    fontSize: '0.9rem',
    color: 'var(--text-secondary)',
  },
  list: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '2px',
  },
  row: {
    display: 'flex',
    gap: '24px',
    padding: '24px',
    backgroundColor: 'var(--bg-card)',
    borderRadius: 'var(--radius-lg)',
    transition: 'var(--transition)',
    animation: 'fadeIn 0.5s ease forwards',
    opacity: 0,
  },
  rowContent: {
    flex: 1,
    minWidth: 0,
  },
  rowMeta: {
    marginBottom: '8px',
  },
  source: {
    fontSize: '0.75rem',
    fontWeight: 600,
    letterSpacing: '0.08em',
    textTransform: 'uppercase' as const,
    color: 'var(--accent)',
  },
  rowTitle: {
    fontFamily: 'var(--font-display)',
    fontSize: '1.15rem',
    fontWeight: 700,
    lineHeight: 1.4,
    color: 'var(--text-primary)',
    marginBottom: '8px',
    transition: 'var(--transition)',
  },
  rowDescription: {
    fontSize: '0.85rem',
    color: 'var(--text-secondary)',
    lineHeight: 1.6,
    marginBottom: '16px',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical' as const,
    overflow: 'hidden',
  },
  rowFooter: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  readLink: {
    fontSize: '0.8rem',
    fontWeight: 500,
    color: 'var(--accent)',
    letterSpacing: '0.03em',
  },
  deleteBtn: {
    backgroundColor: 'transparent',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius)',
    padding: '4px 12px',
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
    cursor: 'pointer',
    transition: 'var(--transition)',
    fontFamily: 'var(--font-body)',
  },
  thumb: {
    width: '120px',
    height: '90px',
    flexShrink: 0,
    borderRadius: 'var(--radius)',
    overflow: 'hidden',
  },
  thumbImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover' as const,
  },
  skeletonRow: {
    display: 'flex',
    gap: '24px',
    padding: '24px',
    backgroundColor: 'var(--bg-card)',
    borderRadius: 'var(--radius-lg)',
  },
  skeletonLeft: {
    flex: 1,
  },
  skeletonThumb: {
    width: '120px',
    height: '90px',
    borderRadius: 'var(--radius)',
    flexShrink: 0,
  },
  empty: {
    textAlign: 'center' as const,
    padding: '100px 0',
    animation: 'fadeIn 0.5s ease forwards',
  },
  emptyIcon: {
    fontSize: '3rem',
    marginBottom: '16px',
    color: 'var(--text-muted)',
  },
  emptyTitle: {
    fontFamily: 'var(--font-display)',
    fontSize: '1.5rem',
    fontWeight: 700,
    color: 'var(--text-primary)',
    marginBottom: '8px',
  },
  emptyText: {
    fontSize: '0.9rem',
    color: 'var(--text-secondary)',
  },
};

export default Bookmarks;