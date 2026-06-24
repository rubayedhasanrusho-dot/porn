import { useLocation } from 'react-router-dom';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AdminAuthProvider } from './context/AdminAuthContext';
import Header from './components/Header';
import HomePage from './pages/HomePage';
import SearchPage from './pages/SearchPage';
import CategoryPage from './pages/CategoryPage';
import VideoPage from './pages/VideoPage';
import CreatorPage from './pages/CreatorPage';
import LoginPage from './pages/LoginPage';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminVideos from './pages/admin/AdminVideos';
import AdminCategories from './pages/admin/AdminCategories';
import AdminAds from './pages/admin/AdminAds';
import AdminSources from './pages/admin/AdminSources';
import AdminUsers from './pages/admin/AdminUsers';
import AdminStats from './pages/admin/AdminStats';
import './App.css';

function AppLayout() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  return (
    <div className="app">
      {!isAdmin && <Header />}
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/category/:slug" element={<CategoryPage />} />
        <Route path="/video/:id" element={<VideoPage />} />
        <Route path="/creator/:creatorName" element={<CreatorPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/videos" element={<AdminVideos />} />
        <Route path="/admin/categories" element={<AdminCategories />} />
        <Route path="/admin/ads" element={<AdminAds />} />
        <Route path="/admin/sources" element={<AdminSources />} />
        <Route path="/admin/users" element={<AdminUsers />} />
        <Route path="/admin/stats" element={<AdminStats />} />
      </Routes>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AdminAuthProvider>
          <AppLayout />
        </AdminAuthProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
