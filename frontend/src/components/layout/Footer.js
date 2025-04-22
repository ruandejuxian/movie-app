import React from 'react';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="footer mt-auto py-3">
      <div className="container">
        <div className="row">
          <div className="col-md-4 mb-3 mb-md-0">
            <h5 className="text-uppercase mb-3">Movie Website</h5>
            <p className="small">
              Website xem phim với đầy đủ tính năng đăng nhập, bình luận, đánh giá và nhiều tính năng khác.
            </p>
          </div>
          
          <div className="col-md-4 mb-3 mb-md-0">
            <h5 className="text-uppercase mb-3">Liên kết</h5>
            <ul className="list-unstyled">
              <li className="mb-2">
                <a href="/" className="text-decoration-none text-secondary">
                  <i className="fas fa-home me-2"></i>Trang chủ
                </a>
              </li>
              <li className="mb-2">
                <a href="/search" className="text-decoration-none text-secondary">
                  <i className="fas fa-search me-2"></i>Tìm kiếm
                </a>
              </li>
              <li className="mb-2">
                <a href="/login" className="text-decoration-none text-secondary">
                  <i className="fas fa-sign-in-alt me-2"></i>Đăng nhập
                </a>
              </li>
            </ul>
          </div>
          
          <div className="col-md-4">
            <h5 className="text-uppercase mb-3">Thông tin</h5>
            <ul className="list-unstyled">
              <li className="mb-2">
                <a href="#" className="text-decoration-none text-secondary">
                  <i className="fas fa-info-circle me-2"></i>Giới thiệu
                </a>
              </li>
              <li className="mb-2">
                <a href="#" className="text-decoration-none text-secondary">
                  <i className="fas fa-question-circle me-2"></i>Trợ giúp
                </a>
              </li>
              <li className="mb-2">
                <a href="#" className="text-decoration-none text-secondary">
                  <i className="fas fa-shield-alt me-2"></i>Chính sách
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        <hr className="my-3" />
        
        <div className="row align-items-center">
          <div className="col-md-6 text-center text-md-start">
            <p className="small mb-0">
              &copy; {currentYear} Movie Website. Tất cả quyền được bảo lưu.
            </p>
          </div>
          <div className="col-md-6 text-center text-md-end mt-3 mt-md-0">
            <a href="#" className="text-secondary me-3">
              <i className="fab fa-facebook-f"></i>
            </a>
            <a href="#" className="text-secondary me-3">
              <i className="fab fa-twitter"></i>
            </a>
            <a href="#" className="text-secondary me-3">
              <i className="fab fa-instagram"></i>
            </a>
            <a href="#" className="text-secondary">
              <i className="fab fa-youtube"></i>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
