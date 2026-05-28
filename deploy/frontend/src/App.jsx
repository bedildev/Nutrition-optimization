import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import { LocalProvider, useLocal } from './context/LocalContext';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import MenuPage from './pages/MenuPage';
import OptimizerPage from './pages/OptimizerPage';
import ProfilePage from './pages/ProfilePage';
import RegisterPage from './pages/RegisterPage';
import './styles.css';

function AppRoutes() {
  const { authUser, logout } = useLocal();

  return (
    <Layout authUser={authUser} onLogout={logout}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={authUser ? <Navigate to="/homepage" replace /> : <LoginPage />} />
        <Route path="/register" element={authUser ? <Navigate to="/homepage" replace /> : <RegisterPage />} />
        <Route
          path="/homepage"
          element={(
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          )}
        />
        <Route
          path="/menu"
          element={(
            <ProtectedRoute>
              <MenuPage />
            </ProtectedRoute>
          )}
        />
        <Route
          path="/ai-optimizer"
          element={(
            <ProtectedRoute>
              <OptimizerPage />
            </ProtectedRoute>
          )}
        />
        <Route
          path="/profile"
          element={(
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          )}
        />
        <Route path="/dashboard" element={<Navigate to="/homepage" replace />} />
        <Route path="/rekomendasi" element={<Navigate to="/menu" replace />} />
        <Route path="/recommendation" element={<Navigate to="/menu" replace />} />
        <Route path="/recomendation" element={<Navigate to="/menu" replace />} />
        <Route path="*" element={<Navigate to={authUser ? '/homepage' : '/'} replace />} />
      </Routes>
    </Layout>
  );
}

function App() {
  return (
    <LocalProvider>
      <AppRoutes />
    </LocalProvider>
  );
}

export default App;
