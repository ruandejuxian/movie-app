const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const modAuth = require('../middleware/modAuth');
const adminAuth = require('../middleware/adminAuth');
const Movie = require('../models/movie.model');
const User = require('../models/user.model');
const axios = require('axios');
const config = require('../config/config');

// @route   GET api/movies
// @desc    Get all movies with filters
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { filter, sortBy, page = 1, limit = 20, search } = req.query;
    const query = {};
    
    // Apply genre filter
    if (filter && filter !== 'all') {
      query.genre = filter;
    }
    
    // Apply search filter
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { director: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Apply sorting
    let sort = {};
    switch (sortBy) {
      case 'newest':
        sort = { createdAt: -1 };
        break;
      case 'oldest':
        sort = { createdAt: 1 };
        break;
      case 'rating':
        sort = { rating: -1 };
        break;
      case 'views':
        sort = { views: -1 };
        break;
      default:
        sort = { createdAt: -1 };
    }
    
    const options = {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      sort
    };
    
    const movies = await Movie.find(query)
      .sort(sort)
      .limit(options.limit)
      .skip((options.page - 1) * options.limit);
    
    const total = await Movie.countDocuments(query);
    
    res.json({
      movies,
      totalPages: Math.ceil(total / options.limit),
      currentPage: options.page,
      totalMovies: total
    });
  } catch (err) {
    console.error('Error fetching movies:', err.message);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
});

// @route   GET api/movies/:id
// @desc    Get movie by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);
    
    if (!movie) {
      return res.status(404).json({ message: 'Không tìm thấy phim' });
    }
    
    // Increment views
    movie.views += 1;
    await movie.save();
    
    res.json(movie);
  } catch (err) {
    console.error('Error fetching movie:', err.message);
    
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Không tìm thấy phim' });
    }
    
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
});

// @route   POST api/movies
// @desc    Create a movie
// @access  Private/Mod
router.post('/', modAuth, async (req, res) => {
  try {
    const {
      title,
      description,
      genre,
      releaseYear,
      director,
      actors,
      poster,
      videoUrl,
      source
    } = req.body;
    
    // Create new movie
    const newMovie = new Movie({
      title,
      description,
      genre,
      releaseYear,
      director,
      actors,
      poster,
      videoUrl,
      source,
      uploadedBy: req.user.id
    });
    
    const movie = await newMovie.save();
    
    res.json(movie);
  } catch (err) {
    console.error('Error creating movie:', err.message);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
});

// @route   PUT api/movies/:id
// @desc    Update a movie
// @access  Private/Mod
router.put('/:id', modAuth, async (req, res) => {
  try {
    const {
      title,
      description,
      genre,
      releaseYear,
      director,
      actors,
      poster,
      videoUrl
    } = req.body;
    
    // Build movie object
    const movieFields = {};
    if (title) movieFields.title = title;
    if (description) movieFields.description = description;
    if (genre) movieFields.genre = genre;
    if (releaseYear) movieFields.releaseYear = releaseYear;
    if (director) movieFields.director = director;
    if (actors) movieFields.actors = actors;
    if (poster) movieFields.poster = poster;
    if (videoUrl) movieFields.videoUrl = videoUrl;
    
    // Update movie
    let movie = await Movie.findById(req.params.id);
    
    if (!movie) {
      return res.status(404).json({ message: 'Không tìm thấy phim' });
    }
    
    movie = await Movie.findByIdAndUpdate(
      req.params.id,
      { $set: movieFields },
      { new: true }
    );
    
    res.json(movie);
  } catch (err) {
    console.error('Error updating movie:', err.message);
    
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Không tìm thấy phim' });
    }
    
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
});

// @route   DELETE api/movies/:id
// @desc    Delete a movie
// @access  Private/Admin
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);
    
    if (!movie) {
      return res.status(404).json({ message: 'Không tìm thấy phim' });
    }
    
    await movie.remove();
    
    res.json({ message: 'Đã xóa phim' });
  } catch (err) {
    console.error('Error deleting movie:', err.message);
    
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Không tìm thấy phim' });
    }
    
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
});

// @route   POST api/movies/:id/rate
// @desc    Rate a movie
// @access  Private
router.post('/:id/rate', auth, async (req, res) => {
  try {
    const { rating } = req.body;
    
    // Validate rating
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Đánh giá phải từ 1 đến 5' });
    }
    
    const movie = await Movie.findById(req.params.id);
    
    if (!movie) {
      return res.status(404).json({ message: 'Không tìm thấy phim' });
    }
    
    // Update movie rating
    const newRating = (movie.rating * movie.ratingCount + rating) / (movie.ratingCount + 1);
    movie.rating = newRating;
    movie.ratingCount += 1;
    
    await movie.save();
    
    res.json(movie);
  } catch (err) {
    console.error('Error rating movie:', err.message);
    
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Không tìm thấy phim' });
    }
    
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
});

// @route   GET api/movies/fetch/external
// @desc    Fetch movies from external API
// @access  Private/Admin
router.get('/fetch/external', adminAuth, async (req, res) => {
  try {
    const response = await axios.get(config.API_MOVIE_URL);
    
    res.json(response.data);
  } catch (err) {
    console.error('Error fetching external movies:', err.message);
    res.status(500).json({ message: 'Lỗi khi lấy dữ liệu từ API bên ngoài' });
  }
});

// @route   POST api/movies/import/external
// @desc    Import movie from external API
// @access  Private/Admin
router.post('/import/external', adminAuth, async (req, res) => {
  try {
    const { movieId } = req.body;
    
    // Fetch movie details from external API
    const response = await axios.get(`${config.API_MOVIE_URL}/movie/${movieId}`);
    const movieData = response.data;
    
    // Check if movie already exists
    let movie = await Movie.findOne({ title: movieData.title });
    
    if (movie) {
      return res.status(400).json({ message: 'Phim đã tồn tại trong hệ thống' });
    }
    
    // Create new movie
    const newMovie = new Movie({
      title: movieData.title,
      description: movieData.description || movieData.plot,
      genre: movieData.genres || [],
      releaseYear: movieData.year || new Date().getFullYear(),
      director: movieData.director || 'Chưa cập nhật',
      actors: movieData.actors || [],
      poster: movieData.poster || '',
      videoUrl: movieData.videoUrl || '',
      source: 'api',
      uploadedBy: req.user.id
    });
    
    movie = await newMovie.save();
    
    res.json(movie);
  } catch (err) {
    console.error('Error importing external movie:', err.message);
    res.status(500).json({ message: 'Lỗi khi nhập phim từ API bên ngoài' });
  }
});

module.exports = router;
