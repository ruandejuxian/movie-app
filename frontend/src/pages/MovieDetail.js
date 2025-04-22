import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const MovieDetail = () => {
  const { id } = useParams();
  const { isAuthenticated, user } = useAuth();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [rating, setRating] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchMovieData = async () => {
      try {
        setLoading(true);
        const movieRes = await axios.get(`/api/movies/${id}`);
        setMovie(movieRes.data);
        
        // Fetch comments
        const commentsRes = await axios.get(`/api/comments/movie/${id}`);
        setComments(commentsRes.data);
        
        // Check if movie is in user's favorites
        if (isAuthenticated) {
          const favRes = await axios.get(`/api/users/check-favorite/${id}`);
          setIsFavorite(favRes.data.isFavorite);
        }
        
        setError(null);
      } catch (err) {
        setError('Không thể tải thông tin phim. Vui lòng thử lại sau.');
        console.error('Error fetching movie data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMovieData();
  }, [id, isAuthenticated]);

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    
    if (!commentText.trim()) return;
    
    try {
      setSubmitting(true);
      const res = await axios.post(`/api/comments`, {
        movie: id,
        content: commentText
      });
      
      setComments([res.data, ...comments]);
      setCommentText('');
    } catch (err) {
      console.error('Error submitting comment:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRatingSubmit = async (newRating) => {
    try {
      await axios.post(`/api/movies/${id}/rate`, { rating: newRating });
      
      // Update local movie state with new rating
      setMovie(prevMovie => ({
        ...prevMovie,
        rating: (prevMovie.rating * prevMovie.ratingCount + newRating) / (prevMovie.ratingCount + 1),
        ratingCount: prevMovie.ratingCount + 1
      }));
      
      setRating(newRating);
    } catch (err) {
      console.error('Error submitting rating:', err);
    }
  };

  const toggleFavorite = async () => {
    try {
      if (isFavorite) {
        await axios.delete(`/api/users/favorites/${id}`);
      } else {
        await axios.post(`/api/users/favorites/${id}`);
      }
      
      setIsFavorite(!isFavorite);
    } catch (err) {
      console.error('Error toggling favorite:', err);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '50vh' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="alert alert-danger" role="alert">
        {error || 'Không tìm thấy phim.'}
      </div>
    );
  }

  return (
    <div className="movie-detail-page">
      <div className="container">
        <div className="row">
          <div className="col-md-4 mb-4">
            <img 
              src={movie.poster || 'https://via.placeholder.com/300x450?text=No+Poster'} 
              alt={movie.title} 
              className="img-fluid rounded shadow"
              style={{ width: '100%' }}
            />
            
            {isAuthenticated && (
              <div className="d-grid gap-2 mt-3">
                <button 
                  className={`btn ${isFavorite ? 'btn-danger' : 'btn-outline-danger'}`}
                  onClick={toggleFavorite}
                >
                  <i className={`${isFavorite ? 'fas' : 'far'} fa-heart me-2`}></i>
                  {isFavorite ? 'Xóa khỏi yêu thích' : 'Thêm vào yêu thích'}
                </button>
              </div>
            )}
          </div>
          
          <div className="col-md-8">
            <div className="movie-detail p-4">
              <h1 className="mb-3">{movie.title}</h1>
              
              <div className="d-flex align-items-center mb-3">
                <div className="me-3">
                  <i className="fas fa-star text-warning me-1"></i>
                  <span>{movie.rating.toFixed(1)}</span>
                  <small className="text-muted ms-1">({movie.ratingCount} đánh giá)</small>
                </div>
                
                <div className="me-3">
                  <i className="fas fa-eye me-1"></i>
                  <span>{movie.views} lượt xem</span>
                </div>
                
                <div>
                  <i className="fas fa-calendar-alt me-1"></i>
                  <span>{movie.releaseYear}</span>
                </div>
              </div>
              
              {isAuthenticated && (
                <div className="rating-section mb-4">
                  <p className="mb-2">Đánh giá phim:</p>
                  <div className="rating">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <i 
                        key={star}
                        className={`${rating >= star ? 'fas' : 'far'} fa-star fa-lg me-1`}
                        style={{ cursor: 'pointer', color: rating >= star ? 'gold' : 'inherit' }}
                        onClick={() => handleRatingSubmit(star)}
                      ></i>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="mb-4">
                <h5>Thể loại:</h5>
                <div>
                  {movie.genre.map((genre, index) => (
                    <span key={index} className="badge bg-secondary me-2 mb-2">{genre}</span>
                  ))}
                </div>
              </div>
              
              <div className="mb-4">
                <h5>Đạo diễn:</h5>
                <p>{movie.director || 'Chưa cập nhật'}</p>
              </div>
              
              <div className="mb-4">
                <h5>Diễn viên:</h5>
                <p>{movie.actors?.join(', ') || 'Chưa cập nhật'}</p>
              </div>
              
              <div className="mb-4">
                <h5>Mô tả:</h5>
                <p>{movie.description}</p>
              </div>
              
              <div className="video-container mb-4">
                <h5 className="mb-3">Xem phim:</h5>
                <div className="ratio ratio-16x9">
                  <iframe 
                    src={movie.videoUrl} 
                    title={movie.title}
                    allowFullScreen
                    className="rounded"
                  ></iframe>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="comment-section mt-5 p-4 rounded">
          <h3 className="mb-4">Bình luận ({comments.length})</h3>
          
          {isAuthenticated ? (
            <form onSubmit={handleCommentSubmit} className="mb-4">
              <div className="mb-3">
                <textarea
                  className="form-control"
                  rows="3"
                  placeholder="Viết bình luận của bạn..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  required
                  style={{ 
                    backgroundColor: 'var(--secondary-color)',
                    color: 'var(--text-color)',
                    borderColor: 'var(--border-color)'
                  }}
                ></textarea>
              </div>
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={submitting}
              >
                {submitting ? 'Đang gửi...' : 'Gửi bình luận'}
              </button>
            </form>
          ) : (
            <div className="alert alert-info mb-4">
              <Link to="/login" className="alert-link">Đăng nhập</Link> để bình luận về phim này.
            </div>
          )}
          
          {comments.length === 0 ? (
            <div className="text-center my-5">
              <p className="text-muted">Chưa có bình luận nào. Hãy là người đầu tiên bình luận!</p>
            </div>
          ) : (
            <div className="comments-list">
              {comments.map(comment => (
                <div key={comment._id} className="comment p-3 mb-3 rounded" style={{ backgroundColor: 'var(--secondary-color)' }}>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <div className="d-flex align-items-center">
                      <img 
                        src={comment.user.avatar || 'https://via.placeholder.com/40'} 
                        alt={comment.user.name}
                        className="rounded-circle me-2"
                        width="40"
                        height="40"
                      />
                      <div>
                        <h6 className="mb-0">{comment.user.name}</h6>
                        <small className="text-muted">
                          {new Date(comment.createdAt).toLocaleDateString('vi-VN', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </small>
                      </div>
                    </div>
                    <div>
                      <button className="btn btn-sm btn-outline-secondary me-2">
                        <i className="far fa-thumbs-up me-1"></i>
                        {comment.likes?.length || 0}
                      </button>
                      <button className="btn btn-sm btn-outline-secondary">
                        <i className="far fa-comment me-1"></i>
                        Trả lời
                      </button>
                    </div>
                  </div>
                  <p className="mb-0">{comment.content}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MovieDetail;
