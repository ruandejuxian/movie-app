import React, { useState, useEffect } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import axios from 'axios';

// Admin Components
import AdminUsers from './admin/AdminUsers';
import AdminMovies from './admin/AdminMovies';
import AdminInviteCodes from './admin/AdminInviteCodes';
import AdminComments from './admin/AdminComments';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalMovies: 0,
    totalComments: 0,
    activeInviteCodes: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const res = await axios.get('/api/admin/stats');
        setStats(res.data);
      } catch (err) {
        console.error('Error fetching admin stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="admin-dashboard">
      <div className="container">
        <h2 className="mb-4">Quản lý Admin</h2>
        
        {loading ? (
          <div className="text-center my-5">
            <div className="spinner"></div>
          </div>
        ) : (
          <>
            <div className="row mb-4">
              <div className="col-md-3 mb-3">
                <div className="card text-center" style={{ backgroundColor: 'var(--card-background)', borderColor: 'var(--border-color)' }}>
                  <div className="card-body">
                    <i className="fas fa-users fa-3x mb-3 text-primary"></i>
                    <h5 className="card-title">Người dùng</h5>
                    <p className="card-text display-6">{stats.totalUsers}</p>
                  </div>
                </div>
              </div>
              
              <div className="col-md-3 mb-3">
                <div className="card text-center" style={{ backgroundColor: 'var(--card-background)', borderColor: 'var(--border-color)' }}>
                  <div className="card-body">
                    <i className="fas fa-film fa-3x mb-3 text-success"></i>
                    <h5 className="card-title">Phim</h5>
                    <p className="card-text display-6">{stats.totalMovies}</p>
                  </div>
                </div>
              </div>
              
              <div className="col-md-3 mb-3">
                <div className="card text-center" style={{ backgroundColor: 'var(--card-background)', borderColor: 'var(--border-color)' }}>
                  <div className="card-body">
                    <i className="fas fa-comments fa-3x mb-3 text-info"></i>
                    <h5 className="card-title">Bình luận</h5>
                    <p className="card-text display-6">{stats.totalComments}</p>
                  </div>
                </div>
              </div>
              
              <div className="col-md-3 mb-3">
                <div className="card text-center" style={{ backgroundColor: 'var(--card-background)', borderColor: 'var(--border-color)' }}>
                  <div className="card-body">
                    <i className="fas fa-key fa-3x mb-3 text-warning"></i>
                    <h5 className="card-title">Mã mời</h5>
                    <p className="card-text display-6">{stats.activeInviteCodes}</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="row">
              <div className="col-md-3 mb-4">
                <div className="list-group" style={{ backgroundColor: 'var(--card-background)', borderColor: 'var(--border-color)' }}>
                  <Link 
                    to="/admin" 
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
                    to="/admin/users" 
                    className="list-group-item list-group-item-action"
                    style={{ 
                      backgroundColor: 'var(--card-background)', 
                      color: 'var(--text-color)',
                      borderColor: 'var(--border-color)'
                    }}
                  >
                    <i className="fas fa-users me-2"></i> Quản lý người dùng
                  </Link>
                  <Link 
                    to="/admin/movies" 
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
                    to="/admin/comments" 
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
                    to="/admin/invite-codes" 
                    className="list-group-item list-group-item-action"
                    style={{ 
                      backgroundColor: 'var(--card-background)', 
                      color: 'var(--text-color)',
                      borderColor: 'var(--border-color)'
                    }}
                  >
                    <i className="fas fa-key me-2"></i> Quản lý mã mời
                  </Link>
                </div>
              </div>
              
              <div className="col-md-9">
                <div className="card" style={{ backgroundColor: 'var(--card-background)', borderColor: 'var(--border-color)' }}>
                  <div className="card-body">
                    <Routes>
                      <Route path="/" element={
                        <div className="text-center my-5">
                          <h4 className="mb-4">Chào mừng đến với trang quản lý Admin</h4>
                          <p>Chọn một mục từ menu bên trái để bắt đầu quản lý.</p>
                        </div>
                      } />
                      <Route path="/users" element={<AdminUsers />} />
                      <Route path="/movies" element={<AdminMovies />} />
                      <Route path="/comments" element={<AdminComments />} />
                      <Route path="/invite-codes" element={<AdminInviteCodes />} />
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

export default AdminDashboard;
