import { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { useAdminAuth } from '../../context/AdminAuthContext';

export default function AdminAds() {
  const { api } = useAdminAuth();
  const [ads, setAds] = useState([]);
  const [form, setForm] = useState({ name: '', code: '', position: 'banner', active: true });
  const [editing, setEditing] = useState(null);

  const load = () => api.get('/admin/ads').then(({ data }) => setAds(data)).catch(() => {});
  useEffect(() => { load(); }, [api]);

  const handleSave = async () => {
    if (editing) await api.put(`/admin/ads/${editing}`, form);
    else await api.post('/admin/ads', form);
    setEditing(null); setForm({ name: '', code: '', position: 'banner', active: true }); load();
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this ad?')) return;
    await api.delete(`/admin/ads/${id}`); load();
  };

  const toggleActive = async (ad) => {
    await api.put(`/admin/ads/${ad._id}`, { active: !ad.active }); load();
  };

  return (
    <AdminLayout>
      <h2>Ad Management</h2>
      <div className="admin-form">
        <input placeholder="Ad name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
        <select value={form.position} onChange={e => setForm({ ...form, position: e.target.value })}>
          <option value="banner">Banner</option>
          <option value="pop">Pop</option>
          <option value="popunder">Popunder</option>
        </select>
        <div style={{ width: '100%' }}>
          <textarea rows={3} placeholder="Ad code (HTML/JS)" value={form.code} onChange={e => setForm({ ...form, code: e.target.value })} />
        </div>
        <label className="checkbox-label">
          <input type="checkbox" checked={form.active} onChange={e => setForm({ ...form, active: e.target.checked })} />
          Active
        </label>
        <button onClick={handleSave}>{editing ? 'Update' : 'Add'}</button>
        {editing && <button type="button" onClick={() => { setEditing(null); setForm({ name: '', code: '', position: 'banner', active: true }); }}>Cancel</button>}
      </div>
      <table className="admin-table">
        <thead><tr><th>Name</th><th>Position</th><th>Active</th><th>Actions</th></tr></thead>
        <tbody>
          {ads.map(a => (
            <tr key={a._id}>
              <td>{a.name}</td><td>{a.position}</td>
              <td><span className={a.active ? 'status-approved' : 'status-rejected'}>{a.active ? 'Yes' : 'No'}</span></td>
              <td className="actions-cell">
                <button onClick={() => toggleActive(a)}>{a.active ? 'Deactivate' : 'Activate'}</button>
                <button onClick={() => { setEditing(a._id); setForm({ name: a.name, code: a.code, position: a.position, active: a.active }); }}>✏️</button>
                <button onClick={() => handleDelete(a._id)}>🗑</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="admin-hint">Adsterra popunder code example: <code>{'<script type="text/javascript"> ... </script>'}</code> — paste the full code into the code field.</p>
    </AdminLayout>
  );
}
