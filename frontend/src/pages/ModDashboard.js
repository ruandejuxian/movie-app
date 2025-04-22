import React, { useState, useEffect } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import axios from 'axios';

// Mod Components
import ModMovies from './mod/ModMovies';
import ModComments from './mod/ModComments';
import ModUsers from './mod/ModUsers';

const ModDashboard = () => {
  const [stats, setStats] = useState({
    totalMovies: 0,
    totalComments: 0,
    pendingComments: 0,
    recentUsers: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const res = await axios.get('/api/mod/stats');
        setStats(res.data);
      } catch (err) {
        console.error('Error fetching mod stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="mod-dashboard">
      <div className="container">
        <h2 className="mb-4">Quản lý Moderator</h2>
        
        {loading ? (
          <div className="text-center my-5">
            <div className="spinner"></div>
          </div>
        ) : (
          <>
            <div className="row mb-4">
              <div className="col-md-4 mb-3">
                <div className="card text-center" style={{ backgroundColor: 'var(--card-background)', borderColor: 'var(--border-color)' }}>
                  <div className="card-body">
                    <i className="fas fa-film fa-3x mb-3 text-success"></i>
                    <h5 className="card-title">Phim</h5>
                    <p className="card-text display-6">{stats.totalMovies}</p>
                  </div>
                </div>
              </div>
              
              <div className="col-md-4 mb-3">
                <div className="card text-center" style={{ backgroundColor: 'var(--card-background)', borderColor: 'var(--border-color)' }}>
                  <div className="card-body">
                    <i className="fas fa-comments fa-3x mb-3 text-info"></i>
                    <h5 className="card-title">Bình luận</h5>
                    <p className="card-text display-6">{stats.totalComments}</p>
                    <span className="badge bg-warning">{stats.pendingComments} chờ duyệt</span>
                  </div>
                </div>
              </div>
              
              <div className="col-md-4 mb-3">
                <div className="card text-center" style={{ backgroundColor: 'var(--card-background)', borderColor: 'var(--border-color)' }}>
                  <div className="card-body">
                    <i className="fas fa-users fa-3x mb-3 text-primary"></i>
                    <h5 className="card-title">Người dùng mới</h5>
                    <p className="card-text display-6">{stats.recentUsers}</p>
                    <span className="badge bg-secondary">7 ngày qua</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="row">
              <div className="col-md-3 mb-4">
                <div className="list-group" style={{ backgroundColor: 'var(--card-background)', borderColor: 'var(--border-color)' }}>
                  <Link 
                    to="/mod" 
                    className="list-group-item list-group-item-action"
                    style={{ 
                      backgroundColor: 'var(--card-background)', 
                      color: 'var(--text-color)',
                      borderColor: 'var(--border-color)'
                    }}
                  >
                    <i className="fas fa-tachometer-alt me-2"></i> Tổng quan
                  </Link>
                  <Link 
                    to="/mod/movies" 
                    className="list-group-item list-group-item-action"
                    style={{ 
                      backgroundColor: 'var(--card-background)', 
                      color: 'var(--text-color)',
                      borderColor: 'var(--border-color)'
                    }}
                  >
                    <i className="fas fa-film me-2"></i> Quản lý phim
                  </Link>
                  <Link 
                    to="/mod/comments" 
                    className="list-group-item list-group-item-action"
                    style={{ 
                      backgroundColor: 'var(--card-background)', 
                      color: 'var(--text-color)',
                      borderColor: 'var(--border-color)'
                    }}
                  >
                    <i className="fas fa-comments me-2"></i> Quản lý bình luận
                  </Link>
                  <Link 
                    to="/mod/users" 
                    className="list-group-item list-group-item-action"
                    style={{ 
                      backgroundColor: 'var(--card-background)', 
                      color: 'var(--text-color)',
                      borderColor: 'var(--border-color)'
                    }}
                  >
                    <i className="fas fa-user-clock me-2"></i> Quản lý người dùng
                  </Link>
                </div>
              </div>
              
              <div className="col-md-9">
                <div className="card" style={{ backgroundColor: 'var(--card-background)', borderColor: 'var(--border-color)' }}>
                  <div className="card-body">
                    <Routes>
                      <Route path="/" element={
                        <div className="text-center my-5">
                          <h4 className="mb-4">Chào mừng đến với trang quản lý Moderator</h4>
                          <p>Chọn một mục từ menu bên trái để bắt đầu quản lý.</p>
                        </div>
                      } />
                      <Route path="/movies" element={<ModMovies />} />
                      <Route path="/comments" element={<ModComments />} />
                      <Route path="/users" element={<ModUsers />} />
                    </Routes>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ModDashboard;
