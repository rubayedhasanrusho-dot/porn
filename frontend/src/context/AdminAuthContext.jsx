import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AdminAuthContext = createContext(null);

export const adminApi = axios.create({ baseURL: '/api' });
const authApi = axios.create({ baseURL: '/api/auth' });

export function AdminAuthProvider({ children }) {
  const [admin, setAdmin] = useState(() => {
    try { return JSON.parse(localStorage.getItem('admin_user')); } catch { return null; }
  });
  const [token, setToken] = useState(() => localStorage.getItem('admin_token'));

  useEffect(() => {
    if (token) {
      adminApi.defaults.headers.common['Authorization'] = 'Bearer ' + token;
    } else {
      delete adminApi.defaults.headers.common['Authorization'];
    }
  }, [token]);

  const login = async (email, password) => {
    const { data } = await authApi.post('/login', { email, password });
    if (data.user.role !== 'admin') throw new Error('Admin access required');
    localStorage.setItem('admin_token', data.token);
    localStorage.setItem('admin_user', JSON.stringify(data.user));
    adminApi.defaults.headers.common['Authorization'] = 'Bearer ' + data.token;
    setToken(data.token);
    setAdmin(data.user);
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    delete adminApi.defaults.headers.common['Authorization'];
    setToken(null);
    setAdmin(null);
  };

  return (
    <AdminAuthContext.Provider value={{ admin, token, login, logout, api: adminApi }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export const useAdminAuth = () => useContext(AdminAuthContext);
