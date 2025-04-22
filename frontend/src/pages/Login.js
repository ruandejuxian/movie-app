import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const { login, googleLogin } = useAuth();
  const navigate = useNavigate();

  const { email, password } = formData;

  const handleChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const success = await login(email, password);
      if (success) {
        navigate('/');
      }
    } catch (err) {
      setError('Đăng nhập thất bại. Vui lòng kiểm tra lại email và mật khẩu.');
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
              <h2 className="text-center mb-4">Đăng nhập</h2>
              
              {error && (
                <div className="alert alert-danger" role="alert">
                  {error}
                </div>
              )}
              
              <form onSubmit={handleSubmit}>
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
                    style={{ 
                      backgroundColor: 'var(--secondary-color)',
                      color: 'var(--text-color)',
                      borderColor: 'var(--border-color)'
                    }}
                  />
                </div>
                
                <button 
                  type="submit" 
                  className="btn btn-primary w-100 mb-3"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Đang đăng nhập...
                    </>
                  ) : 'Đăng nhập'}
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
                    Chưa có tài khoản? <Link to="/register" className="text-decoration-none">Đăng ký</Link>
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

export default Login;
