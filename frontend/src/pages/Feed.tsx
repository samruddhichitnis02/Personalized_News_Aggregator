import { useState, useEffect } from 'react';
import { getFeed, addBookmark, getBookmarks, deleteBookmark } from '../services/api';
import Navbar from '../components/Navbar';

interface Article {
  title: string;
  description: string;
  url: string;
  urlToImage: string;
  source: string;
  publishedAt: string;
  topic: string;
}

interface Bookmark {
  id: number;
  article_url: string;
}

const Feed = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTopic, setActiveTopic] = useState('all');
  const [bookmarking, setBookmarking] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [feedRes, bookmarksRes] = await Promise.all([
          getFeed(),
          getBookmarks(),
        ]);
        setArticles(feedRes.data.articles);
        setBookmarks(bookmarksRes.data);
      } catch (err) {
        console.error('Failed to load feed', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const topics = ['all', ...Array.from(new Set(articles.map((a) => a.topic)))];

  const filtered = activeTopic === 'all'
    ? articles
    : articles.filter((a) => a.topic === activeTopic);

  const isBookmarked = (url: string) =>
    bookmarks.some((b) => b.article_url === url);

  const toggleBookmark = async (article: Article) => {
    setBookmarking(article.url);
    try {
      if (isBookmarked(article.url)) {
        const bm = bookmarks.find((b) => b.article_url === article.url);
        if (bm) {
          await deleteBookmark(bm.id);
          setBookmarks((prev) => prev.filter((b) => b.id !== bm.id));
        }
      } else {
        const res = await addBookmark({
          article_url: article.url,
          title: article.title,
          description: article.description,
          source: article.source,
          image_url: article.urlToImage,
        });
        setBookmarks((prev) => [...prev, res.data]);
      }
    } catch (err) {
      console.error('Bookmark error', err);
    } finally {
      setBookmarking(null);
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div style={styles.page}>
      <Navbar />

      <main style={styles.main}>
        {/* Page Header */}
        <div style={styles.pageHeader}>
          <h1 style={styles.pageTitle}>Your Feed</h1>
          <p style={styles.pageSubtitle}>
            {articles.length} stories curated for you
          </p>
        </div>

        {/* Topic Filter */}
        <div style={styles.topicBar}>
          {topics.map((topic) => (
            <button
              key={topic}
              onClick={() => setActiveTopic(topic)}
              style={{
                ...styles.topicChip,
                ...(activeTopic === topic ? styles.topicChipActive : {}),
              }}
            >
              {topic.charAt(0).toUpperCase() + topic.slice(1)}
            </button>
          ))}
        </div>

        {/* Loading State */}
        {loading && (
          <div style={styles.grid}>
            {[...Array(6)].map((_, i) => (
              <div key={i} style={styles.skeletonCard}>
                <div className="skeleton" style={styles.skeletonImage} />
                <div style={styles.skeletonContent}>
                  <div className="skeleton" style={{ height: '12px', width: '60px', marginBottom: '12px' }} />
                  <div className="skeleton" style={{ height: '20px', width: '100%', marginBottom: '8px' }} />
                  <div className="skeleton" style={{ height: '20px', width: '80%', marginBottom: '16px' }} />
                  <div className="skeleton" style={{ height: '14px', width: '90%' }} />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Articles Grid */}
        {!loading && (
          <div style={styles.grid}>
            {filtered.map((article, i) => (
              <article
                key={article.url}
                style={{
                  ...styles.card,
                  animationDelay: `${i * 0.05}s`,
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-light)';
                  (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)';
                  (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                }}
              >
                {/* Article Image */}
                {article.urlToImage && (
                  <div style={styles.imageWrapper}>
                    <img
                      src={article.urlToImage}
                      alt={article.title}
                      style={styles.image}
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>
                )}

                <div style={styles.cardContent}>
                  {/* Meta */}
                  <div style={styles.meta}>
                    <span style={styles.topicTag}>{article.topic}</span>
                    <span style={styles.dot}>·</span>
                    <span style={styles.source}>{article.source}</span>
                    <span style={styles.dot}>·</span>
                    <span style={styles.date}>{formatDate(article.publishedAt)}</span>
                  </div>

                  {/* Title */}
                  <a href={article.url} target="_blank" rel="noopener noreferrer">
                    <h2 style={styles.title}>{article.title}</h2>
                  </a>

                  {/* Description */}
                  {article.description && (
                    <p style={styles.description}>{article.description}</p>
                  )}

                  {/* Footer */}
                  <div style={styles.cardFooter}>
                    
                      href={article.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={styles.readMore}
                    >
                      Read story →
                    </a>
                    <button
                      onClick={() => toggleBookmark(article)}
                      disabled={bookmarking === article.url}
                      style={{
                        ...styles.bookmarkBtn,
                        ...(isBookmarked(article.url) ? styles.bookmarkBtnActive : {}),
                      }}
                      title={isBookmarked(article.url) ? 'Remove bookmark' : 'Save article'}
                    >
                      {isBookmarked(article.url) ? '★' : '☆'}
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div style={styles.empty}>
            <p style={styles.emptyText}>No articles found for this topic.</p>
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
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '48px 40px',
  },
  pageHeader: {
    marginBottom: '32px',
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
  topicBar: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap' as const,
    marginBottom: '40px',
    paddingBottom: '24px',
    borderBottom: '1px solid var(--border)',
  },
  topicChip: {
    backgroundColor: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: '100px',
    padding: '6px 16px',
    fontSize: '0.8rem',
    fontWeight: 500,
    color: 'var(--text-secondary)',
    cursor: 'pointer',
    transition: 'var(--transition)',
    fontFamily: 'var(--font-body)',
  },
  topicChipActive: {
    backgroundColor: 'var(--accent)',
    borderColor: 'var(--accent)',
    color: '#0a0a0a',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
    gap: '24px',
  },
  card: {
    backgroundColor: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-lg)',
    overflow: 'hidden',
    transition: 'all 0.2s ease',
    animation: 'fadeIn 0.5s ease forwards',
    opacity: 0,
    cursor: 'default',
  },
  imageWrapper: {
    width: '100%',
    height: '180px',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    transition: 'transform 0.3s ease',
  },
  cardContent: {
    padding: '20px',
  },
  meta: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    marginBottom: '12px',
    flexWrap: 'wrap' as const,
  },
  topicTag: {
    fontSize: '0.7rem',
    fontWeight: 600,
    letterSpacing: '0.1em',
    textTransform: 'uppercase' as const,
    color: 'var(--accent)',
  },
  dot: {
    color: 'var(--text-muted)',
    fontSize: '0.7rem',
  },
  source: {
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
  },
  date: {
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
  },
  title: {
    fontFamily: 'var(--font-display)',
    fontSize: '1.1rem',
    fontWeight: 700,
    lineHeight: 1.4,
    color: 'var(--text-primary)',
    marginBottom: '10px',
    transition: 'var(--transition)',
    display: 'block',
  },
  description: {
    fontSize: '0.85rem',
    color: 'var(--text-secondary)',
    lineHeight: 1.6,
    marginBottom: '16px',
    display: '-webkit-box',
    WebkitLineClamp: 3,
    WebkitBoxOrient: 'vertical' as const,
    overflow: 'hidden',
  },
  cardFooter: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: '16px',
    borderTop: '1px solid var(--border)',
  },
  readMore: {
    fontSize: '0.8rem',
    fontWeight: 500,
    color: 'var(--accent)',
    letterSpacing: '0.03em',
  },
  bookmarkBtn: {
    backgroundColor: 'transparent',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius)',
    padding: '4px 10px',
    fontSize: '1rem',
    color: 'var(--text-muted)',
    cursor: 'pointer',
    transition: 'var(--transition)',
  },
  bookmarkBtnActive: {
    color: 'var(--accent)',
    borderColor: 'var(--accent)',
    backgroundColor: 'var(--accent-dim)',
  },
  skeletonCard: {
    backgroundColor: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-lg)',
    overflow: 'hidden',
  },
  skeletonImage: {
    width: '100%',
    height: '180px',
  },
  skeletonContent: {
    padding: '20px',
  },
  empty: {
    textAlign: 'center',
    padding: '80px 0',
  },
  emptyText: {
    color: 'var(--text-muted)',
    fontSize: '0.9rem',
  },
};

export default Feed;