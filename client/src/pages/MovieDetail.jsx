import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../api.js';
import { useAuth } from '../auth.jsx';
import { Cover } from './Browse.jsx';

export default function MovieDetail() {
  const { id } = useParams();
  const { auth } = useAuth();
  const [movie, setMovie] = useState(null);
  const [form, setForm] = useState({ status: 'WantToWatch', rating: '', notes: '' });
  const [saved, setSaved] = useState(false); // is it already in my list?
  const [msg, setMsg] = useState('');

  useEffect(() => {
    api(`/movies/${id}`).then(setMovie).catch((e) => setMsg(e.message));
    if (auth) {
      api(`/mylist/${id}`).then((e) => {
        if (e) { setForm({ status: e.status, rating: e.rating ?? '', notes: e.notes ?? '' }); setSaved(true); }
      }).catch(() => {});
    }
  }, [id, auth]);

  const save = async (ev) => {
    ev.preventDefault();
    try {
      await api(`/mylist/${id}`, {
        method: 'PUT',
        body: { status: form.status, rating: form.rating ? Number(form.rating) : null, notes: form.notes || null },
      });
      setSaved(true); setMsg('Saved ✓');
    } catch (e) { setMsg(e.message); }
  };

  const remove = async () => {
    await api(`/mylist/${id}`, { method: 'DELETE' });
    setSaved(false); setForm({ status: 'WantToWatch', rating: '', notes: '' }); setMsg('Removed from your list');
  };

  if (!movie) return <p className="muted">{msg || 'Loading…'}</p>;

  return (
    <div className="detail" style={{ '--poster': movie.posterUrl ? `url(${movie.posterUrl})` : 'none' }}>
      <Cover url={movie.posterUrl?.replace('/w342/', '/w780/')} big />
      <div>
        <h1>{movie.title}</h1>
        <p className="muted">Released {movie.year ?? 'n/a'}, rated {movie.voteAverage.toFixed(1)}/10 on TMDB</p>
        <span className="tag">{movie.genre}</span>
        <a className="link" href={`https://www.themoviedb.org/movie/${movie.tmdbId}`} target="_blank" rel="noreferrer"> View on TMDB ↗</a>
        {movie.overview && <p className="overview">{movie.overview}</p>}

        <h3>Your shelf</h3>
        {auth ? (
          <form onSubmit={save} className="form">
            <label>Status
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                <option value="WantToWatch">Want to watch</option>
                <option value="Watching">Watching</option>
                <option value="Watched">Watched</option>
              </select>
            </label>
            <label>Rating
              <select value={form.rating} onChange={(e) => setForm({ ...form, rating: e.target.value })}>
                <option value="">—</option>
                {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{'★'.repeat(n)}</option>)}
              </select>
            </label>
            <label>Notes
              <textarea rows="4" maxLength="2000" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            </label>
            <div className="row">
              <button className="btn">{saved ? 'Update' : 'Add to my list'}</button>
              {saved && <button type="button" className="btn ghost" onClick={remove}>Remove</button>}
              {msg && <span className="muted">{msg}</span>}
            </div>
          </form>
        ) : (
          <p><Link className="link" to="/login">Log in</Link> to add this movie to your list.</p>
        )}
      </div>
    </div>
  );
}
