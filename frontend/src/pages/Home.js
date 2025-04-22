import React, { useState, useEffect } from 'react';
import axios from 'axios';
import MovieCard from '../components/movies/MovieCard';
import { useTheme } from '../context/ThemeContext';

const Home = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const { theme } = useTheme();

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        setLoading(true);
        const res = await axios.get('/api/movies', {
          params: { filter, sortBy }
        });
        setMovies(res.data);
        setError(null);
      } catch (err) {
        setError('Không thể tải danh sách phim. Vui lòng thử lại sau.');
        console.error('Error fetching movies:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, [filter, sortBy]);

  const handleFilterChange = (e) => {
    setFilter(e.target.value);
  };

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '50vh' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="home-page">
      <div className="hero-section mb-5 p-4 rounded" style={{ backgroundColor: theme === 'dark' ? '#1a1a1a' : '#f8f9fa' }}>
        <div className="container">
          <div className="row align-items-center">
            <div className="col-md-8">
              <h1 className="display-4 mb-3">Chào mừng đến với Movie Website</h1>
              <p className="lead mb-4">Khám phá thế giới phim ảnh với hàng ngàn bộ phim hấp dẫn. Đăng nhập để trải nghiệm đầy đủ tính năng!</p>
            </div>
            <div className="col-md-4 text-center">
              <i className="fas fa-film fa-5x" style={{ color: '#e50914' }}></i>
            </div>
          </div>
        </div>
      </div>

      <div className="container">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="mb-0">Danh sách phim</h2>
          <div className="d-flex">
            <select 
              className="form-select me-2" 
              value={filter} 
              onChange={handleFilterChange}
              style={{ 
                backgroundColor: theme === 'dark' ? '#2d2d2d' : '#ffffff',
                color: theme === 'dark' ? '#ffffff' : '#212529',
                borderColor: theme === 'dark' ? '#333333' : '#dee2e6'
              }}
            >
              <option value="all">Tất cả thể loại</option>
              <option value="action">Hành động</option>
              <option value="comedy">Hài hước</option>
              <option value="drama">Chính kịch</option>
              <option value="horror">Kinh dị</option>
              <option value="romance">Lãng mạn</option>
              <option value="scifi">Khoa học viễn tưởng</option>
            </select>
            <select 
              className="form-select" 
              value={sortBy} 
              onChange={handleSortChange}
              style={{ 
                backgroundColor: theme === 'dark' ? '#2d2d2d' : '#ffffff',
                color: theme === 'dark' ? '#ffffff' : '#212529',
                borderColor: theme === 'dark' ? '#333333' : '#dee2e6'
              }}
            >
              <option value="newest">Mới nhất</option>
              <option value="oldest">Cũ nhất</option>
              <option value="rating">Đánh giá cao</option>
              <option value="views">Lượt xem nhiều</option>
            </select>
          </div>
        </div>

        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}

        {movies.length === 0 && !loading && !error ? (
          <div className="text-center my-5">
            <i className="fas fa-film fa-3x mb-3" style={{ color: '#6c757d' }}></i>
            <p className="lead">Không tìm thấy phim nào. Vui lòng thử lại với bộ lọc khác.</p>
          </div>
        ) : (
          <div className="row">
            {movies.map(movie => (
              <div key={movie._id} className="col-sm-6 col-md-4 col-lg-3 mb-4">
                <MovieCard movie={movie} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
