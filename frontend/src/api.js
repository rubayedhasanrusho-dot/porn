import axios from 'axios';

const BASE = import.meta.env.VITE_API_URL || 'https://porn-3vv9.onrender.com';

const api = axios.create({ baseURL: BASE });
export const adminApi = axios.create({ baseURL: `${BASE}/api` });
export const authApi = axios.create({ baseURL: `${BASE}/api/auth` });

export default api;
