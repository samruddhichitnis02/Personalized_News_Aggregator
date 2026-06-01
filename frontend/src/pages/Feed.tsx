import { useState, useEffect, useRef } from 'react';
import { getFeed, addBookmark, getBookmarks, deleteBookmark, searchNews, getCountries, updatePreferences } from '../services/api';
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

interface Country {
  code: string;
  name: string;
}

type SearchMode = 'feed' | 'search';

const Feed = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [searchResults, setSearchResults] = useState<Article[]>([]);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<string>('us');
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [countryLoading, setCountryLoading] = useState(false);
  const [activeTopic, setActiveTopic] = useState('all');
  const [bookmarking, setBookmarking] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [visibleCount, setVisibleCount] = useState(9);
  const [mode, setMode] = useState<SearchMode>('feed');
  const [searchPage, setSearchPage] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let cancelled = false;
    const loadData = async () => {
      try {
        const [feedRes, bookmarksRes, countriesRes] = await Promise.all([
          getFeed(),
          getBookmarks(),
          getCountries(),
        ]);
        if (!cancelled) {
          setArticles(feedRes.data.articles);
          setBookmarks(bookmarksRes.data);
          setCountries(countriesRes.data.countries);
        }
      } catch (err) {
        console.error('Failed to load feed', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    loadData();
    return () => { cancelled = true; };
  }, []);

  const handleCountryChange = async (countryCode: string) => {
    setSelectedCountry(countryCode);
    setCountryLoading(true);
    setActiveTopic('all');
    setVisibleCount(9);
    try {
      // get current topics from articles
      const currentTopics = [...new Set(articles.map((a) => a.topic))];
      const topics = currentTopics.length > 0 ? currentTopics : ['technology', 'science'];
      // save preference to backend
      await updatePreferences(topics, countryCode);
      // refetch feed with new country
      const feedRes = await getFeed();
      setArticles(feedRes.data.articles);
    } catch (err) {
      console.error('Country change failed', err);
    } finally {
      setCountryLoading(false);
    }
  };

  const topics = ['all', ...Array.from(new Set(articles.map((a) => a.topic)))];
  const filtered = articles
    .filter((a) => activeTopic === 'all' || a.topic === activeTopic)
    .filter((a) => {
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        a.title?.toLowerCase().includes(q) ||
        a.description?.toLowerCase().includes(q) ||
        a.source?.toLowerCase().includes(q)
      );
    });
  const visible = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;
  const hasMoreSearch = searchResults.length < totalResults;

  const handleSearch = async (page = 1) => {
    const q = searchInput.trim();
    if (!q) return;
    setSearching(true);
    setMode('search');
    setSearchQuery(q);
    setSearchPage(page);
    try {
      const res = await searchNews(q, page);
      if (page === 1) {
        setSearchResults(res.data.articles);
      } else {
        setSearchResults((prev) => [...prev, ...res.data.articles]);
      }
      setTotalResults(res.data.totalResults);
    } catch (err) {
      console.error('Search failed', err);
    } finally {
      setSearching(false);
    }
  };

  const handleClearSearch = () => {
    setMode('feed');
    setSearchInput('');
    setSearch('');
    setSearchResults([]);
    setSearchQuery('');
    setSearchPage(1);
    setTotalResults(0);
  };

  const isBookmarked = (url: string) => bookmarks.some((b) => b.article_url === url);

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
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const displayArticles = mode === 'search' ? searchResults : visible;

  const selectedCountryName = countries.find((c) => c.code === selectedCountry)?.name || 'United States';

  const renderCard = (article: Article, i: number) => (
    <article
      key={article.url + i}
      style={{ ...styles.card, animationDelay: `${(i % 9) * 0.05}s` }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-light)';
        (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)';
        (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
      }}
    >
      {article.urlToImage && (
        <div style={styles.imageWrapper}>
          <img
            src={article.urlToImage}
            alt={article.title}
            style={styles.image}
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
        </div>
      )}
      <div style={styles.cardContent}>
        <div style={styles.meta}>
          <span style={styles.topicTag}>{article.topic}</span>
          <span style={styles.dot}>·</span>
          <span style={styles.source}>{article.source}</span>
          <span style={styles.dot}>·</span>
          <span style={styles.date}>{formatDate(article.publishedAt)}</span>
        </div>
        <a href={article.url} target="_blank" rel="noopener noreferrer">
          <h2 style={styles.title}>{article.title}</h2>
        </a>
        {article.description && <p style={styles.description}>{article.description}</p>}
        <div style={styles.cardFooter}>
          <a href={article.url} target="_blank" rel="noopener noreferrer" style={styles.readMore}>
            Read story
          </a>
          <button
            onClick={() => toggleBookmark(article)}
            disabled={bookmarking === article.url}
            style={{ ...styles.bookmarkBtn, ...(isBookmarked(article.url) ? styles.bookmarkBtnActive : {}) }}
            title={isBookmarked(article.url) ? 'Remove bookmark' : 'Save article'}
          >
            {isBookmarked(article.url) ? '★' : '☆'}
          </button>
        </div>
      </div>
    </article>
  );

  return (
    <div style={styles.page}>
      <Navbar />
      <main style={styles.main}>
        <div style={styles.pageHeader}>
          <div>
            <h1 style={styles.pageTitle}>
              {mode === 'search' ? `Results for "${searchQuery}"` : 'Your Feed'}
            </h1>
            <p style={styles.pageSubtitle}>
              {mode === 'search'
                ? `${totalResults.toLocaleString()} articles found`
                : loading ? 'Loading stories...' : `${filtered.length} stories curated for you`}
            </p>
          </div>
          <div style={styles.searchWrapper}>
            <span style={styles.searchIcon}>⌕</span>
            <input
              ref={searchRef}
              type="text"
              placeholder="Search any topic..."
              value={searchInput}
              onChange={(e) => {
                setSearchInput(e.target.value);
                if (mode === 'feed') setSearch(e.target.value);
              }}
              onKeyDown={(e) => { if (e.key === 'Enter') handleSearch(1); }}
              style={styles.searchInput}
            />
            {searchInput && mode === 'feed' && (
              <button onClick={() => handleSearch(1)} style={styles.searchBtn}>Search</button>
            )}
            {mode === 'search' && (
              <button onClick={handleClearSearch} style={styles.clearBtn}>✕ Back to feed</button>
            )}
          </div>
        </div>

        {mode === 'feed' && (
          <div style={styles.filtersRow}>
            <div style={styles.topicBar}>
              {topics.map((topic) => (
                <button
                  key={topic}
                  onClick={() => { setActiveTopic(topic); setVisibleCount(9); }}
                  style={{ ...styles.topicChip, ...(activeTopic === topic ? styles.topicChipActive : {}) }}
                >
                  {topic.charAt(0).toUpperCase() + topic.slice(1)}
                </button>
              ))}
            </div>

            <div style={styles.countryWrapper}>
              <span style={styles.countryLabel}>
                {countryLoading ? '⏳' : '🌍'} Region
              </span>
              <select
                value={selectedCountry}
                onChange={(e) => handleCountryChange(e.target.value)}
                style={styles.countrySelect}
                disabled={countryLoading}
              >
                {countries.map((c) => (
                  <option key={c.code} value={c.code}>{c.name}</option>
                ))}
              </select>
              {!countryLoading && (
                <span style={styles.countryIndicator}>{selectedCountryName}</span>
              )}
              {countryLoading && (
                <span style={styles.countryIndicator}>Updating feed...</span>
              )}
            </div>
          </div>
        )}

        {(loading || searching || countryLoading) && (
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

        {!loading && !searching && !countryLoading && displayArticles.length === 0 && (
          <div style={styles.empty}>
            <div style={styles.emptyIcon}>{mode === 'search' ? '🔍' : '📰'}</div>
            <p style={styles.emptyText}>
              {mode === 'search'
                ? `No results found for "${searchQuery}"`
                : `No articles found for ${selectedCountryName}. Try a different region.`}
            </p>
            {mode === 'search' && (
              <button onClick={handleClearSearch} style={styles.clearSearchBtn}>Back to feed</button>
            )}
          </div>
        )}

        {!loading && !searching && !countryLoading && displayArticles.length > 0 && (
          <div>
            <div style={styles.grid}>
              {displayArticles.map((article, i) => renderCard(article, i))}
            </div>

            {mode === 'feed' && hasMore && (
              <div style={styles.loadMoreWrapper}>
                <button onClick={() => setVisibleCount((prev) => prev + 9)} style={styles.loadMoreBtn}>
                  Load more stories
                </button>
                <p style={styles.loadMoreCount}>Showing {visible.length} of {filtered.length}</p>
              </div>
            )}

            {mode === 'search' && hasMoreSearch && (
              <div style={styles.loadMoreWrapper}>
                <button
                  onClick={() => handleSearch(searchPage + 1)}
                  style={styles.loadMoreBtn}
                  disabled={searching}
                >
                  {searching ? 'Loading...' : 'Load more results'}
                </button>
                <p style={styles.loadMoreCount}>
                  Showing {searchResults.length} of {totalResults.toLocaleString()}
                </p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

const styles: Record<string, any> = {
  page: { minHeight: '100vh', backgroundColor: 'var(--bg-primary)' },
  main: { maxWidth: '1200px', margin: '0 auto', padding: '48px 40px' },
  pageHeader: {
    display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
    marginBottom: '32px', gap: '24px', flexWrap: 'wrap', animation: 'fadeIn 0.5s ease forwards',
  },
  pageTitle: { fontFamily: 'var(--font-display)', fontSize: '2.5rem', fontWeight: 900, color: 'var(--text-primary)', marginBottom: '8px' },
  pageSubtitle: { fontSize: '0.9rem', color: 'var(--text-secondary)' },
  searchWrapper: { position: 'relative', display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' },
  searchIcon: { position: 'absolute', left: '14px', color: 'var(--text-muted)', fontSize: '1.1rem', pointerEvents: 'none' },
  searchInput: {
    backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-light)',
    borderRadius: 'var(--radius)', padding: '11px 40px 11px 40px',
    fontSize: '0.9rem', color: 'var(--text-primary)', width: '280px',
    fontFamily: 'var(--font-body)', outline: 'none', transition: 'var(--transition)',
  },
  searchBtn: {
    backgroundColor: 'var(--accent)', border: 'none', borderRadius: 'var(--radius)',
    padding: '11px 16px', fontSize: '0.8rem', fontWeight: 600,
    color: '#0a0a0a', cursor: 'pointer', fontFamily: 'var(--font-body)',
  },
  clearBtn: {
    backgroundColor: 'transparent', border: '1px solid var(--border)', borderRadius: 'var(--radius)',
    padding: '8px 12px', fontSize: '0.78rem', color: 'var(--text-muted)', cursor: 'pointer',
    whiteSpace: 'nowrap', fontFamily: 'var(--font-body)',
  },
  filtersRow: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    flexWrap: 'wrap', gap: '16px', marginBottom: '40px',
    paddingBottom: '24px', borderBottom: '1px solid var(--border)',
  },
  topicBar: { display: 'flex', gap: '8px', flexWrap: 'wrap' },
  topicChip: {
    backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '100px',
    padding: '6px 16px', fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-secondary)',
    cursor: 'pointer', transition: 'var(--transition)', fontFamily: 'var(--font-body)',
  },
  topicChipActive: { backgroundColor: 'var(--accent)', borderColor: 'var(--accent)', color: '#0a0a0a' },
  countryWrapper: { display: 'flex', alignItems: 'center', gap: '10px' },
  countryLabel: { fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500 },
  countrySelect: {
    backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)',
    borderRadius: 'var(--radius)', padding: '6px 12px', fontSize: '0.8rem',
    color: 'var(--text-primary)', cursor: 'pointer', fontFamily: 'var(--font-body)',
    outline: 'none',
  },
  countryIndicator: { fontSize: '0.75rem', color: 'var(--text-muted)' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '24px' },
  card: {
    backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)',
    overflow: 'hidden', transition: 'all 0.2s ease', animation: 'fadeIn 0.5s ease forwards', opacity: 0,
  },
  imageWrapper: { width: '100%', height: '180px', overflow: 'hidden' },
  image: { width: '100%', height: '100%', objectFit: 'cover' },
  cardContent: { padding: '20px' },
  meta: { display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px', flexWrap: 'wrap' },
  topicTag: { fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--accent)' },
  dot: { color: 'var(--text-muted)', fontSize: '0.7rem' },
  source: { fontSize: '0.75rem', color: 'var(--text-muted)' },
  date: { fontSize: '0.75rem', color: 'var(--text-muted)' },
  title: { fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 700, lineHeight: 1.4, color: 'var(--text-primary)', marginBottom: '10px', display: 'block' },
  description: { fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '16px', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' },
  cardFooter: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '16px', borderTop: '1px solid var(--border)' },
  readMore: { fontSize: '0.8rem', fontWeight: 500, color: 'var(--accent)', letterSpacing: '0.03em' },
  bookmarkBtn: { backgroundColor: 'transparent', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '4px 10px', fontSize: '1rem', color: 'var(--text-muted)', cursor: 'pointer', transition: 'var(--transition)' },
  bookmarkBtnActive: { color: 'var(--accent)', borderColor: 'var(--accent)', backgroundColor: 'var(--accent-dim)' },
  skeletonCard: { backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' },
  skeletonImage: { width: '100%', height: '180px' },
  skeletonContent: { padding: '20px' },
  empty: { textAlign: 'center', padding: '80px 0', animation: 'fadeIn 0.5s ease forwards' },
  emptyIcon: { fontSize: '2.5rem', marginBottom: '16px' },
  emptyText: { color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '16px' },
  clearSearchBtn: { backgroundColor: 'transparent', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '8px 16px', fontSize: '0.8rem', color: 'var(--text-secondary)', cursor: 'pointer', fontFamily: 'var(--font-body)' },
  loadMoreWrapper: { textAlign: 'center', marginTop: '48px', paddingTop: '32px', borderTop: '1px solid var(--border)' },
  loadMoreBtn: { backgroundColor: 'transparent', border: '1px solid var(--accent)', borderRadius: 'var(--radius)', padding: '12px 32px', fontSize: '0.85rem', fontWeight: 500, color: 'var(--accent)', cursor: 'pointer', fontFamily: 'var(--font-body)', transition: 'var(--transition)', marginBottom: '12px' },
  loadMoreCount: { fontSize: '0.8rem', color: 'var(--text-muted)' },
};

export default Feed;