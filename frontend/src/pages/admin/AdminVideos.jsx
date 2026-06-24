import { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { useAdminAuth } from '../../context/AdminAuthContext';

export default function AdminVideos() {
  const { api } = useAdminAuth();
  const [videos, setVideos] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const load = (p) => {
    api.get(`/admin/videos?page=${p}&limit=30`).then(({ data }) => {
      setVideos(data.videos);
      setTotal(data.total);
      setPage(data.page);
    }).catch(() => {});
  };

  useEffect(() => { load(1); }, [api]);

  const updateStatus = async (id, status) => {
    await api.put(`/videos/${id}`, { status });
    load(page);
  };

  const deleteVideo = async (id) => {
    if (!confirm('Delete this video?')) return;
    await api.delete(`/videos/${id}`);
    load(page);
  };

  return (
    <AdminLayout>
      <h2>Videos ({total})</h2>
      <table className="admin-table">
        <thead><tr><th>Title</th><th>Views</th><th>Status</th><th>Category</th><th>Actions</th></tr></thead>
        <tbody>
          {videos.map((v) => (
            <tr key={v._id}>
              <td className="title-cell">{v.title}</td>
              <td>{v.views}</td>
              <td><span className={`status-${v.status}`}>{v.status}</span></td>
              <td>{v.category?.name || '-'}</td>
              <td className="actions-cell">
                {v.status !== 'approved' && <button onClick={() => updateStatus(v._id, 'approved')}>✓</button>}
                {v.status !== 'rejected' && <button onClick={() => updateStatus(v._id, 'rejected')}>✗</button>}
                <button onClick={() => deleteVideo(v._id)}>🗑</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {total > 30 && (
        <div className="pagination">
          {Array.from({ length: Math.ceil(total / 30) }, (_, i) => (
            <button key={i} onClick={() => load(i + 1)} className={page === i + 1 ? 'active' : ''}>
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </AdminLayout>
  );
}
