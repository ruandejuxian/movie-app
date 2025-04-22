import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { useTheme } from './context/ThemeContext';

// Components
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import ProtectedRoute from './components/common/ProtectedRoute';
import AdminRoute from './components/common/AdminRoute';
import ModRoute from './components/common/ModRoute';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import MovieDetail from './pages/MovieDetail';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';
import ModDashboard from './pages/ModDashboard';
import NotFound from './pages/NotFound';
import Search from './pages/Search';

function App() {
  const { theme } = useTheme();
  const { isAuthenticated, loading } = useAuth();

  useEffect(() => {
    document.body.className = theme === 'dark' ? '' : 'light-mode';
  }, [theme]);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <main className="container py-4">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/" />} />
          <Route path="/register" element={!isAuthenticated ? <Register /> : <Navigate to="/" />} />
          <Route path="/movie/:id" element={<MovieDetail />} />
          <Route path="/search" element={<Search />} />
          
          {/* Protected Routes */}
          <Route path="/profile" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />
          
          {/* Admin Routes */}
          <Route path="/admin/*" element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          } />
          
          {/* Mod Routes */}
          <Route path="/mod/*" element={
            <ModRoute>
              <ModDashboard />
            </ModRoute>
          } />
          
          {/* 404 Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </>
  );
}

export default App;
