import { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { useAdminAuth } from '../../context/AdminAuthContext';

export default function AdminCategories() {
  const { api } = useAdminAuth();
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({ name: '', slug: '', order: 0 });
  const [editing, setEditing] = useState(null);

  const load = () => api.get('/categories').then(({ data }) => setCategories(data)).catch(() => {});
  useEffect(() => { load(); }, [api]);

  const handleSave = async () => {
    if (editing) await api.put(`/categories/${editing}`, form);
    else await api.post('/categories', form);
    setEditing(null); setForm({ name: '', slug: '', order: 0 }); load();
  };

  const handleEdit = (cat) => {
    setEditing(cat._id); setForm({ name: cat.name, slug: cat.slug, order: cat.order || 0 });
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this category?')) return;
    await api.delete(`/categories/${id}`); load();
  };

  return (
    <AdminLayout>
      <h2>Categories</h2>
      <div className="admin-form">
        <input placeholder="Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
        <input placeholder="Slug" value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} />
        <input placeholder="Order" type="number" value={form.order} onChange={e => setForm({ ...form, order: Number(e.target.value) })} />
        <button onClick={handleSave}>{editing ? 'Update' : 'Add'}</button>
        {editing && <button type="button" onClick={() => { setEditing(null); setForm({ name: '', slug: '', order: 0 }); }}>Cancel</button>}
      </div>
      <table className="admin-table">
        <thead><tr><th>Name</th><th>Slug</th><th>Order</th><th>Actions</th></tr></thead>
        <tbody>
          {categories.map(c => (
            <tr key={c._id}>
              <td>{c.name}</td><td>{c.slug}</td><td>{c.order || 0}</td>
              <td className="actions-cell">
                <button onClick={() => handleEdit(c)}>✏️</button>
                <button onClick={() => handleDelete(c._id)}>🗑</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </AdminLayout>
  );
}
