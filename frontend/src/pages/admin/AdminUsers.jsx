import { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { useAdminAuth } from '../../context/AdminAuthContext';

export default function AdminUsers() {
  const { api } = useAdminAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/users').then(({ data }) => setUsers(data)).catch(() => {}).finally(() => setLoading(false));
  }, [api]);

  const changeRole = async (id, role) => {
    await api.put(`/admin/users/${id}`, { role }); window.location.reload();
  };

  const deleteUser = async (id) => {
    if (!confirm('Delete this user?')) return;
    await api.delete(`/admin/users/${id}`); window.location.reload();
  };

  if (loading) return <AdminLayout><div className="loading">Loading...</div></AdminLayout>;

  return (
    <AdminLayout>
      <h2>Users ({users.length})</h2>
      <table className="admin-table">
        <thead><tr><th>Username</th><th>Email</th><th>Role</th><th>Joined</th><th>Actions</th></tr></thead>
        <tbody>
          {users.map(u => (
            <tr key={u._id}>
              <td>{u.username}</td><td>{u.email}</td>
              <td><span className={u.role === 'admin' ? 'status-approved' : ''}>{u.role}</span></td>
              <td>{new Date(u.createdAt).toLocaleDateString()}</td>
              <td className="actions-cell">
                {u.role !== 'admin' && <button onClick={() => changeRole(u._id, 'admin')}>Make Admin</button>}
                {u.role === 'admin' && <button onClick={() => changeRole(u._id, 'user')}>Remove Admin</button>}
                <button onClick={() => deleteUser(u._id)}>🗑</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </AdminLayout>
  );
}
