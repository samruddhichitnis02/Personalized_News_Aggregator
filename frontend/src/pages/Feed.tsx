import { useState, useEffect, useRef, useCallback } from 'react';
import {
  getFeed, addBookmark, getBookmarks, deleteBookmark,
  searchNews, getCountries, updatePreferences,
} from '../services/api';
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
interface Bookmark { id: number; article_url: string; }
interface Country { code: string; name: string; }
type SearchMode = 'feed' | 'search';
type ViewMode = 'grid' | 'list';

// ── Ticker strip ──────────────────────────────────────────────────────────────
const TickerStrip = ({ articles }: { articles: Article[] }) => {
  if (!articles.length) return null;
  const items = [...articles, ...articles]; // duplicate for seamless loop
  return (
    <div style={{
      borderBottom: '1px solid var(--border)',
      borderTop: '1px solid var(--border)',
      overflow: 'hidden', position: 'relative',
      backgroundColor: 'var(--bg-secondary)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <div style={{
          flexShrink: 0, padding: '9px 16px',
          backgroundColor: 'var(--accent)', color: '#080808',
          fontSize: '0.65rem', fontWeight: 700,
          letterSpacing: '0.12em', zIndex: 2,
          display: 'flex', alignItems: 'center', gap: '6px',
        }}>
          <span className="live-dot" />
          LIVE
        </div>
        <div style={{ overflow: 'hidden', flex: 1 }}>
          <div className="ticker-track">
            {items.map((a, i) => (
              <a
                key={i} href={a.url} target="_blank" rel="noopener noreferrer"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '8px',
                  padding: '9px 28px', fontSize: '0.75rem',
                  color: 'var(--text-secondary)', whiteSpace: 'nowrap',
                  transition: 'color 0.15s',
                }}
                onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-primary)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-secondary)')}
              >
                <span style={{
                  color: 'var(--accent)', fontSize: '0.6rem',
                  fontWeight: 700, letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                }}>{a.topic}</span>
                {a.title}
                <span style={{ color: 'var(--border-light)', margin: '0 8px' }}>—</span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Featured hero card ────────────────────────────────────────────────────────
const FeaturedCard = ({
  article, isBookmarked, onBookmark, bookmarking,
}: {
  article: Article;
  isBookmarked: boolean;
  onBookmark: () => void;
  bookmarking: boolean;
}) => {
  const formatDate = (d: string) =>
    d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '';

  return (
    <div
      className="featured-card"
      style={{
        position: 'relative', borderRadius: 'var(--radius-xl)',
        overflow: 'hidden', marginBottom: '32px',
        border: '1px solid var(--border-light)',
        cursor: 'pointer', minHeight: '360px',
        display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
      }}
    >
      {article.urlToImage ? (
        <>
          <img
            className="featured-img"
            src={article.urlToImage}
            alt={article.title}
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
            onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(to top, rgba(8,8,8,0.95) 0%, rgba(8,8,8,0.5) 45%, transparent 80%)',
          }} />
        </>
      ) : (
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(135deg, #111 0%, #1a1a1a 100%)',
        }} />
      )}

      {/* Content */}
      <div style={{ position: 'relative', padding: '28px 32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <span style={{
            backgroundColor: 'var(--accent)', color: '#080808',
            fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.12em',
            textTransform: 'uppercase', padding: '3px 8px', borderRadius: '3px',
          }}>
            {article.topic}
          </span>
          <span style={{ fontSize: '0.72rem', color: 'rgba(240,236,228,0.55)' }}>
            {article.source} · {formatDate(article.publishedAt)}
          </span>
          <span style={{
            marginLeft: 'auto', fontSize: '0.62rem', fontWeight: 600,
            letterSpacing: '0.1em', color: 'rgba(240,236,228,0.4)',
            textTransform: 'uppercase',
          }}>Featured</span>
        </div>
        <a href={article.url} target="_blank" rel="noopener noreferrer">
          <h2 style={{
            fontFamily: 'var(--font-display)', fontSize: 'clamp(1.4rem, 3vw, 2rem)',
            fontWeight: 800, lineHeight: 1.25, color: '#f0ece4',
            marginBottom: '12px', maxWidth: '700px',
          }}>
            {article.title}
          </h2>
        </a>
        {article.description && (
          <p style={{
            fontSize: '0.88rem', color: 'rgba(240,236,228,0.6)',
            lineHeight: 1.6, maxWidth: '560px', marginBottom: '20px',
            display: '-webkit-box', WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical', overflow: 'hidden',
          }}>
            {article.description}
          </p>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <a
            href={article.url} target="_blank" rel="noopener noreferrer"
            className="read-more-link"
            style={{
              fontSize: '0.8rem', fontWeight: 600, color: 'var(--accent)',
              letterSpacing: '0.06em',
            }}
          >
            Read full story →
          </a>
          <button
            onClick={onBookmark}
            disabled={bookmarking}
            style={{
              backgroundColor: isBookmarked ? 'var(--accent-dim)' : 'rgba(255,255,255,0.08)',
              border: `1px solid ${isBookmarked ? 'rgba(245,166,35,0.4)' : 'rgba(255,255,255,0.15)'}`,
              borderRadius: '6px', padding: '6px 12px',
              fontSize: '0.75rem', fontWeight: 500,
              color: isBookmarked ? 'var(--accent)' : 'rgba(240,236,228,0.6)',
              cursor: 'pointer', transition: 'all 0.18s ease',
              display: 'flex', alignItems: 'center', gap: '5px',
            }}
          >
            {isBookmarked ? '★ Saved' : '☆ Save'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Article Card (grid) ───────────────────────────────────────────────────────
const ArticleCard = ({
  article, index, isBookmarked, onBookmark, bookmarking,
}: {
  article: Article;
  index: number;
  isBookmarked: boolean;
  onBookmark: () => void;
  bookmarking: boolean;
}) => {
  const [hovered, setHovered] = useState(false);
  const formatDate = (d: string) =>
    d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '';

  return (
    <article
      className="card-enter"
      style={{
        animationDelay: `${(index % 9) * 0.04}s`,
        backgroundColor: 'var(--bg-card)',
        border: `1px solid ${hovered ? '#2e2e2e' : 'var(--border)'}`,
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        transition: 'border-color 0.2s ease, transform 0.25s cubic-bezier(0.22,1,0.36,1), box-shadow 0.25s ease',
        transform: hovered ? 'translateY(-3px)' : 'translateY(0)',
        boxShadow: hovered ? '0 12px 40px rgba(0,0,0,0.5)' : 'none',
        display: 'flex', flexDirection: 'column',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {article.urlToImage && (
        <div style={{ position: 'relative', width: '100%', height: '176px', overflow: 'hidden' }}>
          <img
            src={article.urlToImage}
            alt={article.title}
            style={{
              width: '100%', height: '100%', objectFit: 'cover',
              transition: 'transform 0.55s cubic-bezier(0.22,1,0.36,1)',
              transform: hovered ? 'scale(1.04)' : 'scale(1)',
            }}
            onError={e => { (e.target as HTMLImageElement).parentElement!.style.display = 'none'; }}
          />
          <div className="card-img-overlay" style={{ opacity: hovered ? 0.6 : 0.4 }} />
          {/* Topic badge over image */}
          <span style={{
            position: 'absolute', top: '10px', left: '10px',
            backgroundColor: 'rgba(8,8,8,0.75)', backdropFilter: 'blur(8px)',
            border: '1px solid rgba(245,166,35,0.25)',
            color: 'var(--accent)', fontSize: '0.6rem',
            fontWeight: 700, letterSpacing: '0.1em',
            textTransform: 'uppercase', padding: '3px 8px', borderRadius: '4px',
          }}>
            {article.topic}
          </span>
        </div>
      )}

      <div style={{ padding: '18px 18px 16px', display: 'flex', flexDirection: 'column', flex: 1 }}>
        {!article.urlToImage && (
          <div style={{ marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{
              color: 'var(--accent)', fontSize: '0.6rem',
              fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
            }}>
              {article.topic}
            </span>
          </div>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{article.source}</span>
          <span style={{ color: 'var(--border-light)', fontSize: '0.65rem' }}>·</span>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{formatDate(article.publishedAt)}</span>
        </div>
        <a href={article.url} target="_blank" rel="noopener noreferrer">
          <h3 style={{
            fontFamily: 'var(--font-display)', fontSize: '1.02rem',
            fontWeight: 700, lineHeight: 1.38,
            color: hovered ? '#fff' : 'var(--text-primary)',
            marginBottom: '8px', transition: 'color 0.18s',
          }}>
            {article.title}
          </h3>
        </a>
        {article.description && (
          <p style={{
            fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.62,
            marginBottom: '14px', flex: 1,
            display: '-webkit-box', WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical', overflow: 'hidden',
          }}>
            {article.description}
          </p>
        )}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          paddingTop: '13px', borderTop: '1px solid var(--border)',
          marginTop: 'auto',
        }}>
          <a
            href={article.url} target="_blank" rel="noopener noreferrer"
            className="read-more-link"
            style={{ fontSize: '0.76rem', fontWeight: 500, color: 'var(--accent)', letterSpacing: '0.03em' }}
          >
            Read story
          </a>
          <button
            onClick={onBookmark}
            disabled={bookmarking}
            style={{
              backgroundColor: isBookmarked ? 'var(--accent-dim)' : 'transparent',
              border: `1px solid ${isBookmarked ? 'rgba(245,166,35,0.35)' : 'var(--border-light)'}`,
              borderRadius: '5px', padding: '4px 10px',
              fontSize: '0.88rem',
              color: isBookmarked ? 'var(--accent)' : 'var(--text-muted)',
              cursor: 'pointer', transition: 'all 0.18s ease',
            }}
            onMouseEnter={e => {
              if (!isBookmarked) (e.currentTarget as HTMLElement).style.borderColor = 'rgba(245,166,35,0.35)';
            }}
            onMouseLeave={e => {
              if (!isBookmarked) (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-light)';
            }}
            title={isBookmarked ? 'Remove bookmark' : 'Save article'}
          >
            {bookmarking ? '…' : isBookmarked ? '★' : '☆'}
          </button>
        </div>
      </div>
    </article>
  );
};

// ── Article Row (list view) ───────────────────────────────────────────────────
const ArticleRow = ({
  article, index, isBookmarked, onBookmark, bookmarking,
}: {
  article: Article; index: number;
  isBookmarked: boolean; onBookmark: () => void; bookmarking: boolean;
}) => {
  const [hovered, setHovered] = useState(false);
  const formatDate = (d: string) =>
    d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '';

  return (
    <article
      className="card-enter"
      style={{
        animationDelay: `${(index % 12) * 0.03}s`,
        display: 'flex', gap: '18px', alignItems: 'flex-start',
        padding: '18px 20px', borderRadius: 'var(--radius-lg)',
        border: `1px solid ${hovered ? '#2a2a2a' : 'var(--border)'}`,
        backgroundColor: hovered ? '#131313' : 'var(--bg-card)',
        transition: 'all 0.18s ease', cursor: 'default',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {article.urlToImage && (
        <div style={{ flexShrink: 0, width: '100px', height: '70px', borderRadius: '6px', overflow: 'hidden' }}>
          <img
            src={article.urlToImage} alt={article.title}
            style={{
              width: '100%', height: '100%', objectFit: 'cover',
              transform: hovered ? 'scale(1.04)' : 'scale(1)',
              transition: 'transform 0.4s ease',
            }}
            onError={e => { (e.target as HTMLImageElement).parentElement!.style.display = 'none'; }}
          />
        </div>
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
          <span style={{
            color: 'var(--accent)', fontSize: '0.6rem',
            fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
          }}>{article.topic}</span>
          <span style={{ color: 'var(--border-light)' }}>·</span>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{article.source}</span>
          <span style={{ color: 'var(--border-light)' }}>·</span>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{formatDate(article.publishedAt)}</span>
        </div>
        <a href={article.url} target="_blank" rel="noopener noreferrer">
          <h3 style={{
            fontFamily: 'var(--font-display)', fontSize: '0.96rem',
            fontWeight: 700, lineHeight: 1.35,
            color: hovered ? '#fff' : 'var(--text-primary)',
            marginBottom: '5px', transition: 'color 0.15s',
          }}>{article.title}</h3>
        </a>
        {article.description && (
          <p style={{
            fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.55,
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
          }}>{article.description}</p>
        )}
      </div>
      <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'flex-end' }}>
        <a href={article.url} target="_blank" rel="noopener noreferrer"
          className="read-more-link"
          style={{ fontSize: '0.72rem', fontWeight: 500, color: 'var(--accent)' }}
        >Read →</a>
        <button onClick={onBookmark} disabled={bookmarking}
          style={{
            backgroundColor: 'transparent', border: 'none', padding: '2px 4px',
            fontSize: '0.9rem', color: isBookmarked ? 'var(--accent)' : 'var(--text-muted)',
            cursor: 'pointer', transition: 'color 0.15s',
          }}
        >{bookmarking ? '…' : isBookmarked ? '★' : '☆'}</button>
      </div>
    </article>
  );
};

// ── Skeleton card ─────────────────────────────────────────────────────────────
const SkeletonCard = ({ view }: { view: ViewMode }) =>
  view === 'list' ? (
    <div style={{
      display: 'flex', gap: '18px', padding: '18px 20px',
      borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)',
      backgroundColor: 'var(--bg-card)',
    }}>
      <div className="skeleton" style={{ width: '100px', height: '70px', borderRadius: '6px', flexShrink: 0 }} />
      <div style={{ flex: 1 }}>
        <div className="skeleton" style={{ height: '10px', width: '80px', marginBottom: '8px' }} />
        <div className="skeleton" style={{ height: '16px', width: '100%', marginBottom: '6px' }} />
        <div className="skeleton" style={{ height: '16px', width: '70%', marginBottom: '8px' }} />
        <div className="skeleton" style={{ height: '11px', width: '55%' }} />
      </div>
    </div>
  ) : (
    <div style={{ borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', overflow: 'hidden', backgroundColor: 'var(--bg-card)' }}>
      <div className="skeleton" style={{ width: '100%', height: '176px' }} />
      <div style={{ padding: '18px' }}>
        <div className="skeleton" style={{ height: '10px', width: '60px', marginBottom: '10px' }} />
        <div className="skeleton" style={{ height: '16px', width: '100%', marginBottom: '6px' }} />
        <div className="skeleton" style={{ height: '16px', width: '80%', marginBottom: '14px' }} />
        <div className="skeleton" style={{ height: '11px', width: '90%' }} />
      </div>
    </div>
  );

// ── Main Feed ─────────────────────────────────────────────────────────────────
const Feed = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [searchResults, setSearchResults] = useState<Article[]>([]);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [selectedCountry, setSelectedCountry] = useState('us');
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [countryLoading, setCountryLoading] = useState(false);
  const [activeTopic, setActiveTopic] = useState('all');
  const [bookmarking, setBookmarking] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState('');
  const [feedSearch, setFeedSearch] = useState('');
  const [visibleCount, setVisibleCount] = useState(9);
  const [mode, setMode] = useState<SearchMode>('feed');
  const [searchPage, setSearchPage] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [countryOpen, setCountryOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [feedRes, bkRes, ctRes] = await Promise.all([getFeed(), getBookmarks(), getCountries()]);
        if (!cancelled) {
          setArticles(feedRes.data.articles);
          setBookmarks(bkRes.data);
          setCountries(ctRes.data.countries);
        }
      } catch (e) { console.error(e); }
      finally { if (!cancelled) setLoading(false); }
    })();
    return () => { cancelled = true; };
  }, []);

  const handleCountryChange = async (code: string) => {
    setSelectedCountry(code);
    setCountryLoading(true);
    setActiveTopic('all');
    setVisibleCount(9);
    setCountryOpen(false);
    try {
      const topics = [...new Set(articles.map(a => a.topic))];
      await updatePreferences(topics.length > 0 ? topics : ['technology'], code);
      const res = await getFeed();
      setArticles(res.data.articles);
    } catch (e) { console.error(e); }
    finally { setCountryLoading(false); }
  };

  const topics = ['all', ...Array.from(new Set(articles.map(a => a.topic)))];

  const filtered = articles
    .filter(a => activeTopic === 'all' || a.topic === activeTopic)
    .filter(a => {
      if (!feedSearch.trim()) return true;
      const q = feedSearch.toLowerCase();
      return a.title?.toLowerCase().includes(q) || a.description?.toLowerCase().includes(q) || a.source?.toLowerCase().includes(q);
    });

  const featuredArticle = mode === 'feed' ? filtered[0] : null;
  const visible = filtered.slice(1, visibleCount + 1); // skip featured
  const hasMore = visibleCount + 1 < filtered.length;
  const hasMoreSearch = searchResults.length < totalResults;

  const handleSearch = useCallback(async (page = 1) => {
    const q = searchInput.trim();
    if (!q) return;
    setSearching(true);
    setMode('search');
    setSearchQuery(q);
    setSearchPage(page);
    try {
      const res = await searchNews(q, page);
      if (page === 1) setSearchResults(res.data.articles);
      else setSearchResults(prev => [...prev, ...res.data.articles]);
      setTotalResults(res.data.totalResults);
    } catch (e) { console.error(e); }
    finally { setSearching(false); }
  }, [searchInput]);

  const handleClearSearch = () => {
    setMode('feed');
    setSearchInput('');
    setFeedSearch('');
    setSearchResults([]);
    setSearchQuery('');
    setSearchPage(1);
    setTotalResults(0);
  };

  const isBookmarked = (url: string) => bookmarks.some(b => b.article_url === url);

  const toggleBookmark = async (article: Article) => {
    setBookmarking(article.url);
    try {
      if (isBookmarked(article.url)) {
        const bm = bookmarks.find(b => b.article_url === article.url);
        if (bm) {
          await deleteBookmark(bm.id);
          setBookmarks(prev => prev.filter(b => b.id !== bm.id));
        }
      } else {
        const res = await addBookmark({
          article_url: article.url, title: article.title,
          description: article.description, source: article.source, image_url: article.urlToImage,
        });
        setBookmarks(prev => [...prev, res.data]);
      }
    } catch (e) { console.error(e); }
    finally { setBookmarking(null); }
  };

  const displayArticles = mode === 'search' ? searchResults : visible;
  const selectedCountryName = countries.find(c => c.code === selectedCountry)?.name || 'United States';

  const isLoading = loading || searching || countryLoading;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-primary)' }}>
      <div className="noise-overlay" />
      <Navbar />

      {/* Ticker — only on feed mode with articles */}
      {!loading && mode === 'feed' && articles.length > 0 && (
        <TickerStrip articles={articles.slice(0, 10)} />
      )}

      <main style={{ maxWidth: '1280px', margin: '0 auto', padding: '40px 40px 80px' }}>

        {/* ── Page header ── */}
        <div style={{
          display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
          marginBottom: '28px', gap: '20px', flexWrap: 'wrap',
          animation: 'fadeUp 0.5s ease forwards',
        }}>
          <div>
            <h1 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(1.8rem, 4vw, 2.6rem)',
              fontWeight: 900, color: 'var(--text-primary)',
              lineHeight: 1.1, marginBottom: '6px',
            }}>
              {mode === 'search'
                ? <><span style={{ color: 'var(--accent)' }}>"{searchQuery}"</span></>
                : 'Your Feed'}
            </h1>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              {mode === 'search'
                ? `${totalResults.toLocaleString()} articles found`
                : loading ? 'Loading stories…' : `${filtered.length} stories curated for you`}
            </p>
          </div>

          {/* Search bar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
            <div style={{ position: 'relative' }}>
              <svg style={{
                position: 'absolute', left: '12px', top: '50%',
                transform: 'translateY(-50%)', pointerEvents: 'none',
              }} width="14" height="14" viewBox="0 0 24 24" fill="none"
                stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input
                ref={searchRef}
                type="text"
                placeholder="Search any topic…"
                value={searchInput}
                onChange={e => {
                  setSearchInput(e.target.value);
                  if (mode === 'feed') setFeedSearch(e.target.value);
                }}
                onKeyDown={e => { if (e.key === 'Enter') handleSearch(1); }}
                style={{
                  backgroundColor: 'var(--bg-card)',
                  border: '1px solid var(--border-light)',
                  borderRadius: '8px', padding: '9px 36px 9px 36px',
                  fontSize: '0.85rem', color: 'var(--text-primary)', width: '260px',
                  transition: 'border-color 0.18s, box-shadow 0.18s',
                }}
                onFocus={e => {
                  e.currentTarget.style.borderColor = 'rgba(245,166,35,0.45)';
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(245,166,35,0.08)';
                }}
                onBlur={e => {
                  e.currentTarget.style.borderColor = 'var(--border-light)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              />
              {searchInput && (
                <button
                  onClick={() => { setSearchInput(''); setFeedSearch(''); if (mode === 'search') handleClearSearch(); }}
                  style={{
                    position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)',
                    backgroundColor: 'transparent', border: 'none', padding: '2px',
                    color: 'var(--text-muted)', fontSize: '0.75rem', cursor: 'pointer', lineHeight: 1,
                  }}
                >✕</button>
              )}
            </div>

            {searchInput && mode === 'feed' && (
              <button onClick={() => handleSearch(1)} style={{
                backgroundColor: 'var(--accent)', border: 'none',
                borderRadius: '8px', padding: '9px 16px',
                fontSize: '0.78rem', fontWeight: 600, color: '#080808',
                cursor: 'pointer', transition: 'opacity 0.15s',
              }}
                onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
                onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
              >Search</button>
            )}

            {mode === 'search' && (
              <button onClick={handleClearSearch} style={{
                backgroundColor: 'transparent',
                border: '1px solid var(--border-light)',
                borderRadius: '8px', padding: '9px 14px',
                fontSize: '0.78rem', color: 'var(--text-secondary)', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '5px', transition: 'all 0.15s',
              }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = '#444')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border-light)')}
              >
                ← Back to feed
              </button>
            )}

            {/* View toggle */}
            {mode === 'feed' && (
              <div style={{
                display: 'flex', border: '1px solid var(--border)',
                borderRadius: '7px', overflow: 'hidden',
              }}>
                {(['grid', 'list'] as ViewMode[]).map(v => (
                  <button key={v} onClick={() => setViewMode(v)} style={{
                    padding: '7px 11px',
                    backgroundColor: viewMode === v ? 'var(--bg-hover)' : 'var(--bg-card)',
                    border: 'none', cursor: 'pointer', transition: 'background 0.15s',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {v === 'grid' ? (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                        stroke={viewMode === v ? 'var(--accent)' : 'var(--text-muted)'}
                        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
                        <rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
                      </svg>
                    ) : (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                        stroke={viewMode === v ? 'var(--accent)' : 'var(--text-muted)'}
                        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/>
                        <line x1="3" y1="18" x2="21" y2="18"/>
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Filter row ── */}
        {mode === 'feed' && (
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            flexWrap: 'wrap', gap: '12px', marginBottom: '32px',
            paddingBottom: '20px', borderBottom: '1px solid var(--border)',
          }}>
            {/* Topic chips */}
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {topics.map(topic => (
                <button
                  key={topic}
                  className="topic-chip"
                  onClick={() => { setActiveTopic(topic); setVisibleCount(9); }}
                  style={{
                    backgroundColor: activeTopic === topic ? 'var(--accent)' : 'var(--bg-card)',
                    border: `1px solid ${activeTopic === topic ? 'var(--accent)' : 'var(--border)'}`,
                    borderRadius: '100px', padding: '5px 14px',
                    fontSize: '0.76rem', fontWeight: 500,
                    color: activeTopic === topic ? '#080808' : 'var(--text-secondary)',
                    cursor: 'pointer', letterSpacing: '0.02em',
                  }}
                >
                  {topic.charAt(0).toUpperCase() + topic.slice(1)}
                </button>
              ))}
            </div>

            {/* Country custom dropdown */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setCountryOpen(o => !o)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)',
                  borderRadius: '8px', padding: '6px 12px',
                  fontSize: '0.78rem', color: 'var(--text-secondary)',
                  cursor: 'pointer', transition: 'all 0.15s',
                  minWidth: '170px', justifyContent: 'space-between',
                }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = '#333')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {countryLoading
                    ? <span className="spinner" style={{ width: '12px', height: '12px', borderWidth: '1.5px' }} />
                    : <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/>
                        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                      </svg>
                  }
                  {countryLoading ? 'Updating…' : selectedCountryName}
                </span>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                  style={{ transform: countryOpen ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }}>
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </button>

              {countryOpen && countries.length > 0 && (
                <div style={{
                  position: 'absolute', top: 'calc(100% + 6px)', right: 0,
                  backgroundColor: '#161616', border: '1px solid #2a2a2a',
                  borderRadius: '10px', minWidth: '200px', maxHeight: '260px',
                  overflowY: 'auto', zIndex: 50,
                  boxShadow: '0 16px 48px rgba(0,0,0,0.6)',
                  animation: 'fadeUp 0.15s ease forwards',
                  padding: '4px',
                }}>
                  {countries.map(c => (
                    <button key={c.code} onClick={() => handleCountryChange(c.code)} style={{
                      width: '100%', textAlign: 'left',
                      backgroundColor: c.code === selectedCountry ? 'var(--accent-dim)' : 'transparent',
                      border: 'none', padding: '8px 12px',
                      fontSize: '0.8rem',
                      color: c.code === selectedCountry ? 'var(--accent)' : 'var(--text-secondary)',
                      cursor: 'pointer', borderRadius: '6px',
                      transition: 'all 0.12s', fontFamily: 'var(--font-body)',
                    }}
                      onMouseEnter={e => { if (c.code !== selectedCountry) (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--bg-hover)'; }}
                      onMouseLeave={e => { if (c.code !== selectedCountry) (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'; }}
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Loading ── */}
        {isLoading && (
          <div style={{
            display: viewMode === 'grid'
              ? 'grid'
              : 'flex',
            flexDirection: viewMode === 'list' ? 'column' : undefined,
            gridTemplateColumns: viewMode === 'grid' ? 'repeat(auto-fill, minmax(320px, 1fr))' : undefined,
            gap: '20px',
          }}>
            {[...Array(viewMode === 'grid' ? 6 : 8)].map((_, i) => (
              <SkeletonCard key={i} view={viewMode} />
            ))}
          </div>
        )}

        {/* ── Empty ── */}
        {!isLoading && displayArticles.length === 0 && (mode === 'search' || filtered.length === 0) && (
          <div style={{
            textAlign: 'center', padding: '100px 0',
            animation: 'fadeUp 0.4s ease forwards',
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '16px', opacity: 0.4 }}>
              {mode === 'search' ? '🔍' : '📭'}
            </div>
            <p style={{ fontSize: '1rem', fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '6px' }}>
              {mode === 'search' ? `No results for "${searchQuery}"` : `No articles found`}
            </p>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
              {mode === 'search' ? 'Try a different keyword' : `Try switching to a different region or topic`}
            </p>
            {mode === 'search' && (
              <button onClick={handleClearSearch} style={{
                backgroundColor: 'transparent', border: '1px solid var(--border)',
                borderRadius: '8px', padding: '9px 20px',
                fontSize: '0.82rem', color: 'var(--text-secondary)', cursor: 'pointer',
              }}>← Back to feed</button>
            )}
          </div>
        )}

        {/* ── Content ── */}
        {!isLoading && (
          <>
            {/* Featured card — feed mode only */}
            {mode === 'feed' && featuredArticle && (
              <FeaturedCard
                article={featuredArticle}
                isBookmarked={isBookmarked(featuredArticle.url)}
                onBookmark={() => toggleBookmark(featuredArticle)}
                bookmarking={bookmarking === featuredArticle.url}
              />
            )}

            {/* Grid / List */}
            {displayArticles.length > 0 && (
              <div style={
                viewMode === 'grid'
                  ? { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }
                  : { display: 'flex', flexDirection: 'column', gap: '10px' }
              }>
                {(mode === 'search' ? displayArticles : displayArticles).map((article, i) =>
                  viewMode === 'grid'
                    ? <ArticleCard key={article.url + i} article={article} index={i}
                        isBookmarked={isBookmarked(article.url)}
                        onBookmark={() => toggleBookmark(article)}
                        bookmarking={bookmarking === article.url} />
                    : <ArticleRow key={article.url + i} article={article} index={i}
                        isBookmarked={isBookmarked(article.url)}
                        onBookmark={() => toggleBookmark(article)}
                        bookmarking={bookmarking === article.url} />
                )}
              </div>
            )}

            {/* Load more */}
            {mode === 'feed' && hasMore && (
              <div style={{ textAlign: 'center', marginTop: '52px' }}>
                <button onClick={() => setVisibleCount(p => p + 9)} style={{
                  backgroundColor: 'transparent',
                  border: '1px solid var(--border-light)',
                  borderRadius: '8px', padding: '11px 32px',
                  fontSize: '0.83rem', fontWeight: 500, color: 'var(--text-secondary)',
                  cursor: 'pointer', transition: 'all 0.18s',
                }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.borderColor = 'var(--accent)';
                    (e.currentTarget as HTMLElement).style.color = 'var(--accent)';
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-light)';
                    (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)';
                  }}
                >
                  Load more stories
                </button>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '10px' }}>
                  Showing {visible.length + 1} of {filtered.length}
                </p>
              </div>
            )}

            {mode === 'search' && hasMoreSearch && (
              <div style={{ textAlign: 'center', marginTop: '52px' }}>
                <button
                  onClick={() => handleSearch(searchPage + 1)}
                  disabled={searching}
                  style={{
                    backgroundColor: 'transparent',
                    border: '1px solid var(--border-light)',
                    borderRadius: '8px', padding: '11px 32px',
                    fontSize: '0.83rem', fontWeight: 500, color: 'var(--text-secondary)',
                    cursor: 'pointer', opacity: searching ? 0.6 : 1,
                  }}
                >
                  {searching ? <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><span className="spinner" /> Loading…</span> : 'Load more results'}
                </button>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '10px' }}>
                  Showing {searchResults.length} of {totalResults.toLocaleString()}
                </p>
              </div>
            )}
          </>
        )}
      </main>

      {/* Close country dropdown on outside click */}
      {countryOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 49 }} onClick={() => setCountryOpen(false)} />
      )}
    </div>
  );
};

export default Feed;