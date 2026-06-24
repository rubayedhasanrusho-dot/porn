import { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { useAdminAuth } from '../../context/AdminAuthContext';

export default function AdminSources() {
  const { api } = useAdminAuth();
  const [sources, setSources] = useState([]);
  const [form, setForm] = useState({ url: '', name: '', active: true });
  const [editing, setEditing] = useState(null);

  const load = () => api.get('/sources').then(({ data }) => setSources(data)).catch(() => {});
  useEffect(() => { load(); }, [api]);

  const handleSave = async () => {
    if (editing) await api.put(`/sources/${editing}`, form);
    else await api.post('/sources', form);
    setEditing(null); setForm({ url: '', name: '', active: true }); load();
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this source?')) return;
    await api.delete(`/sources/${id}`); load();
  };

  return (
    <AdminLayout>
      <h2>Sources</h2>
      <p className="admin-hint">Add xhamster.com page URLs to auto-scrape videos from. The homepage will automatically load from these sources.</p>
      <div className="admin-form">
        <input placeholder="Source name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
        <input placeholder="URL (e.g. https://xhamster.com)" value={form.url} onChange={e => setForm({ ...form, url: e.target.value })} />
        <label className="checkbox-label">
          <input type="checkbox" checked={form.active} onChange={e => setForm({ ...form, active: e.target.checked })} />
          Active
        </label>
        <button onClick={handleSave}>{editing ? 'Update' : 'Add'}</button>
        {editing && <button type="button" onClick={() => { setEditing(null); setForm({ url: '', name: '', active: true }); }}>Cancel</button>}
      </div>
      <table className="admin-table">
        <thead><tr><th>Name</th><th>URL</th><th>Active</th><th>Last Scraped</th><th>Actions</th></tr></thead>
        <tbody>
          {sources.map(s => (
            <tr key={s._id}>
              <td>{s.name}</td><td className="title-cell">{s.url}</td>
              <td><span className={s.active ? 'status-approved' : 'status-rejected'}>{s.active ? 'Yes' : 'No'}</span></td>
              <td>{s.lastScraped ? new Date(s.lastScraped).toLocaleDateString() : '-'}</td>
              <td className="actions-cell">
                <button onClick={() => { setEditing(s._id); setForm({ url: s.url, name: s.name, active: s.active }); }}>✏️</button>
                <button onClick={() => handleDelete(s._id)}>🗑</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </AdminLayout>
  );
}
