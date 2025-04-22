import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useNotification } from '../../context/NotificationContext';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { unreadCount } = useNotification();

  return (
    <nav className="navbar navbar-expand-lg navbar-dark sticky-top mb-4">
      <div className="container">
        <Link className="navbar-brand" to="/">
          <i className="fas fa-film me-2"></i>
          Movie Website
        </Link>
        
        <button 
          className="navbar-toggler" 
          type="button" 
          data-bs-toggle="collapse" 
          data-bs-target="#navbarNav"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto">
            <li className="nav-item">
              <Link className="nav-link" to="/">
                <i className="fas fa-home me-1"></i> Trang chủ
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/search">
                <i className="fas fa-search me-1"></i> Tìm kiếm
              </Link>
            </li>
          </ul>
          
          <ul className="navbar-nav ms-auto">
            <li className="nav-item">
              <button 
                className="nav-link theme-switch border-0 bg-transparent" 
                onClick={toggleTheme}
              >
                {theme === 'dark' ? (
                  <i className="fas fa-sun me-1"></i>
                ) : (
                  <i className="fas fa-moon me-1"></i>
                )}
                {theme === 'dark' ? 'Chế độ sáng' : 'Chế độ tối'}
              </button>
            </li>
            
            {isAuthenticated ? (
              <>
                <li className="nav-item">
                  <Link className="nav-link position-relative" to="/notifications">
                    <i className="fas fa-bell me-1"></i> Thông báo
                    {unreadCount > 0 && (
                      <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                        {unreadCount}
                      </span>
                    )}
                  </Link>
                </li>
                
                {user && user.role === 'admin' && (
                  <li className="nav-item">
                    <Link className="nav-link" to="/admin">
                      <i className="fas fa-user-shield me-1"></i> Admin
                    </Link>
                  </li>
                )}
                
                {user && user.role === 'mod' && (
                  <li className="nav-item">
                    <Link className="nav-link" to="/mod">
                      <i className="fas fa-user-cog me-1"></i> Mod
                    </Link>
                  </li>
                )}
                
                <li className="nav-item dropdown">
                  <a 
                    className="nav-link dropdown-toggle" 
                    href="#" 
                    id="navbarDropdown" 
                    role="button" 
                    data-bs-toggle="dropdown"
                  >
                    <i className="fas fa-user me-1"></i> {user?.name}
                  </a>
                  <ul className="dropdown-menu dropdown-menu-end">
                    <li>
                      <Link className="dropdown-item" to="/profile">
                        <i className="fas fa-id-card me-2"></i> Hồ sơ
                      </Link>
                    </li>
                    <li>
                      <Link className="dropdown-item" to="/favorites">
                        <i className="fas fa-heart me-2"></i> Phim yêu thích
                      </Link>
                    </li>
                    <li>
                      <Link className="dropdown-item" to="/history">
                        <i className="fas fa-history me-2"></i> Lịch sử xem
                      </Link>
                    </li>
                    <li><hr className="dropdown-divider" /></li>
                    <li>
                      <button 
                        className="dropdown-item" 
                        onClick={logout}
                      >
                        <i className="fas fa-sign-out-alt me-2"></i> Đăng xuất
                      </button>
                    </li>
                  </ul>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/login">
                    <i className="fas fa-sign-in-alt me-1"></i> Đăng nhập
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/register">
                    <i className="fas fa-user-plus me-1"></i> Đăng ký
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
