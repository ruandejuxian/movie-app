import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    inviteCode: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const { register, googleLogin } = useAuth();
  const navigate = useNavigate();

  const { name, email, password, confirmPassword, inviteCode } = formData;

  const handleChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setError('Mật khẩu không khớp');
      return;
    }
    
    if (!inviteCode) {
      setError('Mã mời là bắt buộc');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const userData = { name, email, password };
      const success = await register(userData, inviteCode);
      if (success) {
        navigate('/');
      }
    } catch (err) {
      setError('Đăng ký thất bại. Vui lòng kiểm tra lại thông tin và mã mời.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    googleLogin();
  };

  return (
    <div className="container">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card shadow-sm" style={{ backgroundColor: 'var(--card-background)', borderColor: 'var(--border-color)' }}>
            <div className="card-body p-4">
              <h2 className="text-center mb-4">Đăng ký</h2>
              
              {error && (
                <div className="alert alert-danger" role="alert">
                  {error}
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
                    value={name}
                    onChange={handleChange}
                    required
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
                    value={email}
                    onChange={handleChange}
                    required
                    style={{ 
                      backgroundColor: 'var(--secondary-color)',
                      color: 'var(--text-color)',
                      borderColor: 'var(--border-color)'
                    }}
                  />
                </div>
                
                <div className="mb-3">
                  <label htmlFor="password" className="form-label">Mật khẩu</label>
                  <input
                    type="password"
                    className="form-control"
                    id="password"
                    name="password"
                    value={password}
                    onChange={handleChange}
                    required
                    minLength="6"
                    style={{ 
                      backgroundColor: 'var(--secondary-color)',
                      color: 'var(--text-color)',
                      borderColor: 'var(--border-color)'
                    }}
                  />
                </div>
                
                <div className="mb-3">
                  <label htmlFor="confirmPassword" className="form-label">Xác nhận mật khẩu</label>
                  <input
                    type="password"
                    className="form-control"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={confirmPassword}
                    onChange={handleChange}
                    required
                    minLength="6"
                    style={{ 
                      backgroundColor: 'var(--secondary-color)',
                      color: 'var(--text-color)',
                      borderColor: 'var(--border-color)'
                    }}
                  />
                </div>
                
                <div className="mb-3">
                  <label htmlFor="inviteCode" className="form-label">Mã mời</label>
                  <input
                    type="text"
                    className="form-control"
                    id="inviteCode"
                    name="inviteCode"
                    value={inviteCode}
                    onChange={handleChange}
                    required
                    style={{ 
                      backgroundColor: 'var(--secondary-color)',
                      color: 'var(--text-color)',
                      borderColor: 'var(--border-color)'
                    }}
                  />
                  <small className="form-text text-muted">Bạn cần mã mời từ Admin hoặc Mod để đăng ký.</small>
                </div>
                
                <button 
                  type="submit" 
                  className="btn btn-primary w-100 mb-3"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Đang đăng ký...
                    </>
                  ) : 'Đăng ký'}
                </button>
                
                <div className="text-center mb-3">
                  <span>hoặc</span>
                </div>
                
                <button 
                  type="button" 
                  className="btn btn-outline-light w-100 mb-3"
                  onClick={handleGoogleLogin}
                >
                  <i className="fab fa-google me-2"></i>
                  Đăng nhập với Google
                </button>
                
                <div className="text-center mt-3">
                  <p>
                    Đã có tài khoản? <Link to="/login" className="text-decoration-none">Đăng nhập</Link>
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
