import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';
import { Cover } from './Browse.jsx';

const TABS = [['', 'All'], ['WantToWatch', 'Want to watch'], ['Watching', 'Watching'], ['Watched', 'Watched']];

export default function MyList() {
  const [status, setStatus] = useState('');
  const [items, setItems] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    api('/mylist' + (status ? `?status=${status}` : '')).then(setItems).catch((e) => setError(e.message));
  }, [status]);

  return (
    <>
      <h1>My List</h1>
      <div className="tabs">
        {TABS.map(([v, label]) => (
          <button key={v} className={status === v ? 'btn' : 'btn ghost'} onClick={() => setStatus(v)}>{label}</button>
        ))}
      </div>
      {error && <p className="error">{error}</p>}
      {items.length === 0 && <p className="muted">Nothing here yet. <Link className="link" to="/">Browse movies</Link> to add some.</p>}
      <div className="list">
        {items.map((i) => (
          <Link key={i.movieId} to={`/movie/${i.movieId}`} className="row-card">
            <Cover url={i.posterUrl} />
            <div>
              <strong>{i.title}</strong>
              <div><span className="tag">{i.genre}</span> <span className="tag alt">{i.status}</span> {i.rating && <span className="stars">{'★'.repeat(i.rating)}</span>}</div>
              {i.notes && <p className="notes">“{i.notes}”</p>}
            </div>
          </Link>
        ))}
      </div>
    </>
  );
}
