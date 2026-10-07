import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';
import { useAuth } from '../auth.jsx';

export default function Browse() {
  const { auth } = useAuth();
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [genre, setGenre] = useState('');
  const [sort, setSort] = useState('rating');
  const [page, setPage] = useState(1);
  const [genres, setGenres] = useState([]);
  const [data, setData] = useState({ items: [], total: 0, pageSize: 24 });
  const [error, setError] = useState('');

  useEffect(() => { api('/movies/genres').then(setGenres).catch((e) => setError(e.message)); }, []);

  // debounce the search box
  useEffect(() => {
    const t = setTimeout(() => { setQuery(search); setPage(1); }, 350);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    const qs = new URLSearchParams({ search: query, genre, sort, page });
    setLoading(true);
    api('/movies?' + qs)
      .then((d) => { setData(d); setError(''); })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [query, genre, sort, page]);

  const pages = Math.max(1, Math.ceil(data.total / data.pageSize));

  return (
    <>
      {!query && !genre && page === 1 && sort === 'rating' && <Hero movies={data.items.slice(0, 3)} loggedIn={!!auth} />}
      <div className="filters">
        <input placeholder="Search movies…" value={search} onChange={(e) => setSearch(e.target.value)} />
        <select value={genre} onChange={(e) => { setGenre(e.target.value); setPage(1); }}>
          <option value="">All genres</option>
          {genres.map((g) => <option key={g}>{g}</option>)}
        </select>
        <select value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="rating">Sort: Top rated</option>
          <option value="year">Sort: Newest</option>
          <option value="title">Sort: Title</option>
        </select>
      </div>
      {error && <p className="error">{error} — is the API running on port 5080?</p>}
      <p className="muted count">{data.total} movies</p>
      {data.total === 0 && !error && <p className="muted">No movies yet. The importer may still be running — refresh in a moment (and check your TMDB API key is set).</p>}
      <div className="grid" id="browse">
        {loading && data.items.length === 0 && Array.from({ length: 12 }, (_, i) => <div key={i} className="card skeleton" />)}
        {data.items.map((b) => (
          <Link key={b.id} to={`/movie/${b.id}`} className="card">
            <div className="poster">
              <Cover url={b.posterUrl} />
              <span className="badge">★ {b.voteAverage.toFixed(1)}</span>
            </div>
            <div className="card-body">
              <strong>{b.title}</strong>
              <span className="muted">{b.year ?? 'Year unknown'}</span>
              <span className="tag">{b.genre}</span>
            </div>
          </Link>
        ))}
      </div>
      <div className="pager">
        <button className="btn ghost" disabled={page <= 1} onClick={() => setPage(page - 1)}>← Prev</button>
        <span>Page {page} / {pages}</span>
        <button className="btn ghost" disabled={page >= pages} onClick={() => setPage(page + 1)}>Next →</button>
      </div>
    </>
  );
}

export function Cover({ url, big }) {
  return url
    ? <img className={big ? 'cover big' : 'cover'} src={url} alt="" loading="lazy" />
    : <div className={big ? 'cover big empty' : 'cover empty'}>No cover</div>;
}

function Hero({ movies, loggedIn }) {
  return (
    <section className="hero">
      <div className="hero-text">
        <h1>Remember every film you watch.</h1>
        <p>Browse top-rated movies from TMDB, save them to your own list with a rating and notes, and see which genres you love most.</p>
        <div className="row">
          <a className="btn" href="#browse">Browse movies</a>
          {!loggedIn && <Link className="btn ghost" to="/login">Create a free account</Link>}
        </div>
      </div>
      <div className="fan" aria-hidden="true">
        {movies.map((m, i) => m.posterUrl && <img key={m.id} className={`fan-${i + 1}`} src={m.posterUrl} alt="" />)}
      </div>
    </section>
  );
}
