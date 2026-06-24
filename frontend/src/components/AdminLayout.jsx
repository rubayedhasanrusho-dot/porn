import { useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../context/AdminAuthContext';

export default function AdminLayout({ children }) {
  const { admin, logout } = useAdminAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!admin) navigate('/admin/login');
  }, [admin, navigate]);

  if (!admin) return null;

  const links = [
    { to: '/admin', label: 'Dashboard', icon: '📊' },
    { to: '/admin/videos', label: 'Videos', icon: '🎬' },
    { to: '/admin/categories', label: 'Categories', icon: '🏷️' },
    { to: '/admin/ads', label: 'Ads', icon: '📢' },
    { to: '/admin/sources', label: 'Sources', icon: '🔗' },
    { to: '/admin/users', label: 'Users', icon: '👥' },
    { to: '/admin/stats', label: 'Stats', icon: '📈' },
  ];

  return (
    <div className="admin-page">
      <header className="admin-header-bar">
        <Link to="/admin" className="admin-header-logo">TUBE<span>MAX</span> <small>Admin</small></Link>
        <div className="admin-header-right">
          <span className="admin-user-name">{admin.username}</span>
          <Link to="/" className="admin-header-link">Back to Site</Link>
          <button onClick={logout} className="nav-btn">Logout</button>
        </div>
      </header>
      <div className="admin-layout">
        <aside className="admin-sidebar">
          <ul>
            {links.map((l) => (
              <li key={l.to}>
                <Link
                  to={l.to}
                  className={location.pathname === l.to ? 'active' : ''}
                >
                  {l.icon} {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </aside>
        <main className="admin-content">{children}</main>
      </div>
    </div>
  );
}
