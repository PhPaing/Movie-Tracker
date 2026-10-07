import { useEffect, useState } from 'react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { api } from '../api.js';

export default function Stats() {
  const [s, setS] = useState(null);
  const [error, setError] = useState('');
  useEffect(() => { api('/stats').then(setS).catch((e) => setError(e.message)); }, []);

  if (error) return <p className="error">{error}</p>;
  if (!s) return <p className="muted">Loading…</p>;
  if (s.total === 0) return <p className="muted">Add some movies to your list to see your stats.</p>;

  const count = (name) => s.byStatus.find((x) => x.status === name)?.count ?? 0;

  return (
    <>
      <h1>Your movie stats</h1>
      <div className="stat-row">
        <Stat label="Movies on list" value={s.total} />
        <Stat label="Watched" value={count('Watched')} />
        <Stat label="Watching" value={count('Watching')} />
        <Stat label="Avg rating" value={s.averageRating ? s.averageRating.toFixed(1) + ' ★' : '—'} />
      </div>
      <h3>Your top genres</h3>
      <div className="chart">
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={s.topGenres} margin={{ left: -10 }}>
            <CartesianGrid stroke="#2A3768" strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="genre" interval={0} angle={-20} textAnchor="end" height={70} tick={{ fontSize: 12, fill: '#9AA6CC' }} />
            <YAxis allowDecimals={false} tick={{ fill: '#9AA6CC' }} />
            <Tooltip cursor={{ fill: 'rgba(255,255,255,.06)' }} contentStyle={{ background: '#16204A', border: '1px solid #2A3768', borderRadius: 8, color: '#EEF1FB' }} />
            <Bar dataKey="count" name="Movies" fill="#FFB547" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </>
  );
}

const Stat = ({ label, value }) => (
  <div className="stat"><div className="stat-value">{value}</div><div className="muted">{label}</div></div>
);
