import { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { useAdminAuth } from '../../context/AdminAuthContext';

export default function AdminStats() {
  const { api } = useAdminAuth();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get('/admin/stats').then(({ data }) => setStats(data)).catch(() => {});
  }, [api]);

  if (!stats) return <AdminLayout><div className="loading">Loading...</div></AdminLayout>;

  return (
    <AdminLayout>
      <h2>Site Stats</h2>
      <div className="stat-cards">
        <div className="stat-card"><span className="stat-num">{stats.totalVideos}</span><span>Total Videos</span></div>
        <div className="stat-card"><span className="stat-num">{stats.totalViews}</span><span>Total Views</span></div>
        <div className="stat-card"><span className="stat-num">{stats.totalUsers}</span><span>Users</span></div>
      </div>

      {stats.topVideos?.length > 0 && (
        <>
          <h2>Most Viewed</h2>
          <table className="admin-table">
            <thead><tr><th>#</th><th>Title</th><th>Views</th></tr></thead>
            <tbody>
              {stats.topVideos.map((v, i) => (
                <tr key={v._id}>
                  <td>{i + 1}</td>
                  <td className="title-cell">{v.title}</td>
                  <td>{v.views}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </AdminLayout>
  );
}
