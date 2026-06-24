import { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { useAdminAuth } from '../../context/AdminAuthContext';

export default function AdminDashboard() {
  const { api } = useAdminAuth();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get('/admin/stats').then(({ data }) => setStats(data)).catch(() => {});
  }, [api]);

  if (!stats) return <AdminLayout><div className="loading">Loading...</div></AdminLayout>;

  return (
    <AdminLayout>
      <h2>Dashboard</h2>
      <div className="stat-cards">
        <div className="stat-card"><span className="stat-num">{stats.totalVideos}</span><span>Videos</span></div>
        <div className="stat-card"><span className="stat-num">{stats.totalViews}</span><span>Views</span></div>
        <div className="stat-card"><span className="stat-num">{stats.totalUsers}</span><span>Users</span></div>
        <div className="stat-card"><span className="stat-num">{stats.totalCategories}</span><span>Categories</span></div>
        <div className="stat-card warning"><span className="stat-num">{stats.pendingVideos}</span><span>Pending</span></div>
      </div>

      {stats.topVideos?.length > 0 && (
        <>
          <h2>Top Videos</h2>
          <table className="admin-table">
            <thead><tr><th>Title</th><th>Views</th><th>Source</th></tr></thead>
            <tbody>
              {stats.topVideos.map(v => (
                <tr key={v._id}>
                  <td className="title-cell">{v.title}</td>
                  <td>{v.views}</td>
                  <td>{v.source?.replace('https://', '').split('/')[0]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </AdminLayout>
  );
}
