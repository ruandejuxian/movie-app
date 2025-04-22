import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const Profile = () => {
  const { user, updateProfile, logout } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [favorites, setFavorites] = useState([]);
  const [watchHistory, setWatchHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [activeTab, setActiveTab] = useState('profile');

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
      fetchUserData();
    }
  }, [user]);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      
      // Fetch favorites
      const favRes = await axios.get('/api/users/favorites');
      setFavorites(favRes.data);
      
      // Fetch watch history
      const historyRes = await axios.get('/api/users/watch-history');
      setWatchHistory(historyRes.data);
      
    } catch (err) {
      console.error('Error fetching user data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Clear messages when user starts typing
    setError(null);
    setSuccess(null);
  };

  const handleSubmit = async e => {
    e.preventDefault();
    
    // Validate passwords if user is trying to change password
    if (formData.newPassword) {
      if (!formData.currentPassword) {
        setError('Vui lòng nhập mật khẩu hiện tại');
        return;
      }
      
      if (formData.newPassword !== formData.confirmPassword) {
        setError('Mật khẩu mới không khớp');
        return;
      }
    }
    
    try {
      setUpdating(true);
      setError(null);
      
      const updateData = {
        name: formData.name
      };
      
      if (formData.newPassword) {
        updateData.currentPassword = formData.currentPassword;
        updateData.newPassword = formData.newPassword;
      }
      
      const success = await updateProfile(updateData);
      
      if (success) {
        setSuccess('Cập nhật thông tin thành công');
        setFormData({
          ...formData,
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      }
    } catch (err) {
      setError('Cập nhật thông tin thất bại');
    } finally {
      setUpdating(false);
    }
  };

  const removeFavorite = async (movieId) => {
    try {
      await axios.delete(`/api/users/favorites/${movieId}`);
      setFavorites(favorites.filter(movie => movie._id !== movieId));
    } catch (err) {
      console.error('Error removing favorite:', err);
    }
  };

  const clearWatchHistory = async () => {
    try {
      await axios.delete('/api/users/watch-history');
      setWatchHistory([]);
    } catch (err) {
      console.error('Error clearing watch history:', err);
    }
  };

  if (!user) {
    return (
      <div className="alert alert-warning" role="alert">
        Vui lòng đăng nhập để xem trang cá nhân.
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="container">
        <div className="row">
          <div className="col-md-3 mb-4">
            <div className="card" style={{ backgroundColor: 'var(--card-background)', borderColor: 'var(--border-color)' }}>
              <div className="card-body text-center">
                <img 
                  src={user.avatar || 'https://via.placeholder.com/150'} 
                  alt={user.name}
                  className="rounded-circle mb-3"
                  width="100"
                  height="100"
                />
                <h5 className="card-title">{user.name}</h5>
                <p className="card-text text-muted">{user.email}</p>
                <p className="badge bg-primary">{user.role === 'admin' ? 'Admin' : user.role === 'mod' ? 'Moderator' : 'Thành viên'}</p>
              </div>
            </div>
            
            <div className="list-group mt-4" style={{ backgroundColor: 'var(--card-background)', borderColor: 'var(--border-color)' }}>
              <button 
                className={`list-group-item list-group-item-action ${activeTab === 'profile' ? 'active' : ''}`}
                onClick={() => setActiveTab('profile')}
                style={{ 
                  backgroundColor: activeTab === 'profile' ? 'var(--accent-color)' : 'var(--card-background)', 
                  color: 'var(--text-color)',
                  borderColor: 'var(--border-color)'
                }}
              >
                <i className="fas fa-user me-2"></i> Thông tin cá nhân
              </button>
              <button 
                className={`list-group-item list-group-item-action ${activeTab === 'favorites' ? 'active' : ''}`}
                onClick={() => setActiveTab('favorites')}
                style={{ 
                  backgroundColor: activeTab === 'favorites' ? 'var(--accent-color)' : 'var(--card-background)', 
                  color: 'var(--text-color)',
                  borderColor: 'var(--border-color)'
                }}
              >
                <i className="fas fa-heart me-2"></i> Phim yêu thích
              </button>
              <button 
                className={`list-group-item list-group-item-action ${activeTab === 'history' ? 'active' : ''}`}
                onClick={() => setActiveTab('history')}
                style={{ 
                  backgroundColor: activeTab === 'history' ? 'var(--accent-color)' : 'var(--card-background)', 
                  color: 'var(--text-color)',
                  borderColor: 'var(--border-color)'
                }}
              >
                <i className="fas fa-history me-2"></i> Lịch sử xem
              </button>
              <button 
                className="list-group-item list-group-item-action text-danger"
                onClick={logout}
                style={{ 
                  backgroundColor: 'var(--card-background)', 
                  borderColor: 'var(--border-color)'
                }}
              >
                <i className="fas fa-sign-out-alt me-2"></i> Đăng xuất
              </button>
            </div>
          </div>
          
          <div className="col-md-9">
            {activeTab === 'profile' && (
              <div className="card" style={{ backgroundColor: 'var(--card-background)', borderColor: 'var(--border-color)' }}>
                <div className="card-header">
                  <h4 className="mb-0">Thông tin cá nhân</h4>
                </div>
                <div className="card-body">
                  {error && (
                    <div className="alert alert-danger" role="alert">
                      {error}
                    </div>
                  )}
                  
                  {success && (
                    <div className="alert alert-success" role="alert">
                      {success}
                    </div>
                  )}
                  
                  <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                      <label htmlFor="name" className="form-label">Họ tên</label>
                      <input
                        type="text"
                        className="form-control"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        style={{ 
                          backgroundColor: 'var(--secondary-color)',
                          color: 'var(--text-color)',
                          borderColor: 'var(--border-color)'
                        }}
                      />
                    </div>
                    
                    <div className="mb-3">
                      <label htmlFor="email" className="form-label">Email</label>
                      <input
                        type="email"
                        className="form-control"
                        id="email"
                        name="email"
                        value={formData.email}
                        disabled
                        style={{ 
                          backgroundColor: 'var(--secondary-color)',
                          color: 'var(--text-color)',
                          borderColor: 'var(--border-color)'
                        }}
                      />
                      <small className="form-text text-muted">Email không thể thay đổi.</small>
                    </div>
                    
                    <h5 className="mt-4 mb-3">Đổi mật khẩu</h5>
                    
                    <div className="mb-3">
                      <label htmlFor="currentPassword" className="form-label">Mật khẩu hiện tại</label>
                      <input
                        type="password"
                        className="form-control"
                        id="currentPassword"
                        name="currentPassword"
                        value={formData.currentPassword}
                        onChange={handleChange}
                        style={{ 
                          backgroundColor: 'var(--secondary-color)',
                          color: 'var(--text-color)',
                          borderColor: 'var(--border-color)'
                        }}
                      />
                    </div>
                    
                    <div className="mb-3">
                      <label htmlFor="newPassword" className="form-label">Mật khẩu mới</label>
                      <input
                        type="password"
                        className="form-control"
                        id="newPassword"
                        name="newPassword"
                        value={formData.newPassword}
                        onChange={handleChange}
                        style={{ 
                          backgroundColor: 'var(--secondary-color)',
                          color: 'var(--text-color)',
                          borderColor: 'var(--border-color)'
                        }}
                      />
                    </div>
                    
                    <div className="mb-3">
                      <label htmlFor="confirmPassword" className="form-label">Xác nhận mật khẩu mới</label>
                      <input
                        type="password"
                        className="form-control"
                        id="confirmPassword"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        style={{ 
                          backgroundColor: 'var(--secondary-color)',
                          color: 'var(--text-color)',
                          borderColor: 'var(--border-color)'
                        }}
                      />
                    </div>
                    
                    <button 
                      type="submit" 
                      className="btn btn-primary"
                      disabled={updating}
                    >
                      {updating ? 'Đang cập nhật...' : 'Cập nhật thông tin'}
                    </button>
                  </form>
                </div>
              </div>
            )}
            
            {activeTab === 'favorites' && (
              <div className="card" style={{ backgroundColor: 'var(--card-background)', borderColor: 'var(--border-color)' }}>
                <div className="card-header d-flex justify-content-between align-items-center">
                  <h4 className="mb-0">Phim yêu thích</h4>
                </div>
                <div className="card-body">
                  {loading ? (
                    <div className="text-center my-5">
                      <div className="spinner"></div>
                    </div>
                  ) : favorites.length === 0 ? (
                    <div className="text-center my-5">
                      <p className="text-muted">Bạn chưa có phim yêu thích nào.</p>
                    </div>
                  ) : (
                    <div className="table-responsive">
                      <table className="table table-hover" style={{ color: 'var(--text-color)' }}>
                        <thead>
                          <tr>
                            <th>Phim</th>
                            <th>Thể loại</th>
                            <th>Năm</th>
                            <th>Đánh giá</th>
                            <th>Thao tác</th>
                          </tr>
                        </thead>
                        <tbody>
                          {favorites.map(movie => (
                            <tr key={movie._id}>
                              <td>
                                <div className="d-flex align-items-center">
                                  <img 
                                    src={movie.poster || 'https://via.placeholder.com/50x75?text=No+Poster'} 
                                    alt={movie.title}
                                    width="50"
                                    height="75"
                                    className="me-3"
                                  />
                                  <a href={`/movie/${movie._id}`} className="text-decoration-none" style={{ color: 'var(--text-color)' }}>
                                    {movie.title}
                                  </a>
                                </div>
                              </td>
                              <td>{movie.genre.join(', ')}</td>
                              <td>{movie.releaseYear}</td>
                              <td>
                                <i className="fas fa-star text-warning me-1"></i>
                                {movie.rating.toFixed(1)}
                              </td>
                              <td>
                                <button 
                                  className="btn btn-sm btn-danger"
                                  onClick={() => removeFavorite(movie._id)}
                                >
                                  <i className="fas fa-trash-alt"></i>
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {activeTab === 'history' && (
              <div className="card" style={{ backgroundColor: 'var(--card-background)', borderColor: 'var(--border-color)' }}>
                <div className="card-header d-flex justify-content-between align-items-center">
                  <h4 className="mb-0">Lịch sử xem</h4>
                  {watchHistory.length > 0 && (
                    <button 
                      className="btn btn-sm btn-danger"
                      onClick={clearWatchHistory}
                    >
                      <i className="fas fa-trash-alt me-2"></i>
                      Xóa lịch sử
                    </button>
                  )}
                </div>
                <div className="card-body">
                  {loading ? (
                    <div className="text-center my-5">
                      <div className="spinner"></div>
                    </div>
                  ) : watchHistory.length === 0 ? (
                    <div className="text-center my-5">
                      <p className="text-muted">Bạn chưa xem phim nào.</p>
                    </div>
                  ) : (
                    <div className="table-responsive">
                      <table className="table table-hover" style={{ color: 'var(--text-color)' }}>
                        <thead>
                          <tr>
                            <th>Phim</th>
                            <th>Thể loại</th>
                            <th>Thời gian xem</th>
                          </tr>
                        </thead>
                        <tbody>
                          {watchHistory.map(item => (
                            <tr key={item._id}>
                              <td>
                                <div className="d-flex align-items-center">
                                  <img 
                                    src={item.movie.poster || 'https://via.placeholder.com/50x75?text=No+Poster'} 
                                    alt={item.movie.title}
                                    width="50"
                                    height="75"
                                    className="me-3"
                                  />
                                  <a href={`/movie/${item.movie._id}`} className="text-decoration-none" style={{ color: 'var(--text-color)' }}>
                                    {item.movie.title}
                                  </a>
                                </div>
                              </td>
                              <td>{item.movie.genre.join(', ')}</td>
                              <td>
                                {new Date(item.watchedAt).toLocaleDateString('vi-VN', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
