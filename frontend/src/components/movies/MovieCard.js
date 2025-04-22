import React from 'react';
import { Link } from 'react-router-dom';

const MovieCard = ({ movie }) => {
  return (
    <div className="movie-card">
      <Link to={`/movie/${movie._id}`}>
        <img 
          src={movie.poster || 'https://via.placeholder.com/300x450?text=No+Poster'} 
          alt={movie.title} 
          className="card-img-top"
        />
      </Link>
      <div className="movie-card-body">
        <h5 className="movie-title">
          <Link to={`/movie/${movie._id}`} className="text-decoration-none text-white">
            {movie.title}
          </Link>
        </h5>
        <div className="movie-info mb-2">
          <span className="me-2">
            <i className="fas fa-calendar-alt me-1"></i>
            {movie.releaseYear || 'N/A'}
          </span>
          <span>
            <i className="fas fa-star me-1 text-warning"></i>
            {movie.rating.toFixed(1)}
          </span>
        </div>
        <div className="d-flex justify-content-between">
          <Link to={`/movie/${movie._id}`} className="btn btn-sm btn-primary">
            <i className="fas fa-play me-1"></i> Xem phim
          </Link>
          <button className="btn btn-sm btn-outline-light">
            <i className="far fa-heart"></i>
          </button>
        </div>
      </div>
    </div>
  );
};

export default MovieCard;
