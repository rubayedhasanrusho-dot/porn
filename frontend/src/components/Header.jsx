import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';

export default function Header() {
  const { user, logout } = useAuth();
  const [search, setSearch] = useState('');
  const [categories, setCategories] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/api/categories').then(({ data }) => setCategories(data)).catch(() => {});
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) navigate(`/search?q=${encodeURIComponent(search.trim())}`);
  };

  return (
    <header className="site-header">
      <div className="header-inner">
        <Link to="/" className="logo">TUBE<span>MAX</span></Link>

        <form className="header-search" onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Search videos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button type="submit">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
            </svg>
          </button>
        </form>

        <nav className="header-nav">
          {user ? (
            <>
              {user.role === 'admin' && <Link to="/admin" className="nav-link">Admin</Link>}
              <button onClick={logout} className="nav-btn-outline">Logout</button>
              <span className="nav-link" style={{ color: '#e84c3d', fontWeight: 600 }}>{user.username}</span>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-btn">Login</Link>
            </>
          )}
        </nav>
      </div>

      {/* Category bar - xHamster style */}
      <div className="category-bar">
        <div className="category-bar-inner">
          <Link to="/" className={`category-tab ${window.location.pathname === '/' ? 'active' : ''}`}>🔥 All</Link>
          {categories.map((cat) => (
            <Link
              key={cat._id}
              to={`/category/${cat.slug}`}
              className={`category-tab ${window.location.pathname === `/category/${cat.slug}` ? 'active' : ''}`}
            >
              {cat.icon} {cat.name}
            </Link>
          ))}
        </div>
      </div>
    </header>
  );
}
