import { Link, NavLink, Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './auth.jsx';
import Browse from './pages/Browse.jsx';
import MovieDetail from './pages/MovieDetail.jsx';
import MyList from './pages/MyList.jsx';
import Stats from './pages/Stats.jsx';
import Login from './pages/Login.jsx';

function Protected({ children }) {
  const { auth } = useAuth();
  return auth ? children : <Navigate to="/login" replace />;
}

export default function App() {
  const { auth, logout } = useAuth();
  return (
    <>
      <header className="nav">
        <Link to="/" className="brand"><span className="logo" aria-hidden="true">▶</span>MovieTracker</Link>
        <nav>
          <NavLink to="/">Browse</NavLink>
          {auth && <NavLink to="/my-list">My List</NavLink>}
          {auth && <NavLink to="/stats">Stats</NavLink>}
        </nav>
        <div className="spacer" />
        {auth ? (
          <>
            <span className="muted">{auth.email}</span>
            <button className="btn ghost" onClick={logout}>Log out</button>
          </>
        ) : (
          <Link className="btn" to="/login">Log in</Link>
        )}
      </header>
      <main className="container">
        <Routes>
          <Route path="/" element={<Browse />} />
          <Route path="/movie/:id" element={<MovieDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/my-list" element={<Protected><MyList /></Protected>} />
          <Route path="/stats" element={<Protected><Stats /></Protected>} />
        </Routes>
      </main>
      <footer className="footer">
        <span>Built with ASP.NET Core, EF Core, SQL Server, React and JWT auth.</span>
        <span>
          <a href="https://github.com/PhPaing/Movie-Tracker" target="_blank" rel="noreferrer">Source on GitHub</a>
          {' '}· Movie data from TMDB. Not endorsed or certified by TMDB.
        </span>
      </footer>
    </>
  );
}
