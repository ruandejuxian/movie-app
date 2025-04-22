const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const modAuth = require('../middleware/modAuth');
const Movie = require('../models/movie.model');
const User = require('../models/user.model');
const Notification = require('../models/notification.model');
const movieApiService = require('../utils/movieApiService');
const googleDriveService = require('../utils/googleDriveService');
const { google } = require('googleapis');
const config = require('../config/config');

// @route   GET api/movies/api/search
// @desc    Search movies from external API
// @access  Private/Mod
router.get('/api/search', modAuth, async (req, res) => {
  try {
    const { keyword, page = 1, limit = 20 } = req.query;
    
    if (!keyword) {
      return res.status(400).json({ message: 'Từ khóa tìm kiếm là bắt buộc' });
    }
    
    const searchResults = await movieApiService.searchMovies(keyword, { page, limit });
    
    res.json(searchResults);
  } catch (err) {
    console.error('Error searching API movies:', err.message);
    res.status(500).json({ message: 'Lỗi khi tìm kiếm phim từ API' });
  }
});

// @route   GET api/movies/api/details/:id
// @desc    Get movie details from external API
// @access  Private/Mod
router.get('/api/details/:id', modAuth, async (req, res) => {
  try {
    const movieDetails = await movieApiService.getMovieDetails(req.params.id);
    
    res.json(movieDetails);
  } catch (err) {
    console.error('Error fetching API movie details:', err.message);
    res.status(500).json({ message: 'Lỗi khi lấy thông tin chi tiết phim từ API' });
  }
});

// @route   POST api/movies/api/import
// @desc    Import movie from external API to database
// @access  Private/Mod
router.post('/api/import', modAuth, async (req, res) => {
  try {
    const { apiMovieId } = req.body;
    
    if (!apiMovieId) {
      return res.status(400).json({ message: 'ID phim API là bắt buộc' });
    }
    
    // Check if movie already exists
    const existingMovie = await Movie.findOne({ apiId: apiMovieId });
    if (existingMovie) {
      return res.status(400).json({ message: 'Phim này đã được nhập vào hệ thống' });
    }
    
    // Fetch movie details from API
    const apiMovieDetails = await movieApiService.getMovieDetails(apiMovieId);
    
    // Map API data to our model
    const movieData = movieApiService.mapApiMovieToModel(apiMovieDetails);
    
    // Add additional fields
    movieData.apiId = apiMovieId;
    movieData.uploadedBy = req.user.id;
    
    // Create new movie in database
    const newMovie = new Movie(movieData);
    await newMovie.save();
    
    // Create notification for all users
    const notification = new Notification({
      user: req.user.id, // Admin/Mod who imported the movie
      content: `Phim mới đã được thêm: ${movieData.title}`,
      type: 'new_movie',
      relatedMovie: newMovie._id
    });
    
    await notification.save();
    
    res.json(newMovie);
  } catch (err) {
    console.error('Error importing API movie:', err.message);
    res.status(500).json({ message: 'Lỗi khi nhập phim từ API' });
  }
});

// @route   GET api/movies/drive/list
// @desc    List videos from Google Drive
// @access  Private/Mod
router.get('/drive/list', modAuth, async (req, res) => {
  try {
    const { pageToken, pageSize = 10 } = req.query;
    
    // Initialize Google Drive service
    await googleDriveService.initialize();
    
    // List video files
    const filesList = await googleDriveService.listFiles({
      pageToken,
      pageSize: parseInt(pageSize, 10),
      query: "mimeType contains 'video/'"
    });
    
    res.json(filesList);
  } catch (err) {
    console.error('Error listing Google Drive videos:', err.message);
    res.status(500).json({ message: 'Lỗi khi lấy danh sách video từ Google Drive' });
  }
});

// @route   GET api/movies/drive/file/:fileId
// @desc    Get file details from Google Drive
// @access  Private/Mod
router.get('/drive/file/:fileId', modAuth, async (req, res) => {
  try {
    // Initialize Google Drive service
    await googleDriveService.initialize();
    
    // Get file details
    const fileDetails = await googleDriveService.getFile(req.params.fileId);
    
    res.json(fileDetails);
  } catch (err) {
    console.error('Error getting Google Drive file details:', err.message);
    res.status(500).json({ message: 'Lỗi khi lấy thông tin file từ Google Drive' });
  }
});

// @route   POST api/movies/drive/import
// @desc    Import movie from Google Drive to database
// @access  Private/Mod
router.post('/drive/import', modAuth, async (req, res) => {
  try {
    const { 
      fileId, 
      title, 
      description, 
      genre, 
      releaseYear, 
      director, 
      actors 
    } = req.body;
    
    if (!fileId) {
      return res.status(400).json({ message: 'ID file Google Drive là bắt buộc' });
    }
    
    // Check if movie already exists
    const existingMovie = await Movie.findOne({ driveFileId: fileId });
    if (existingMovie) {
      return res.status(400).json({ message: 'Phim này đã được nhập vào hệ thống' });
    }
    
    // Initialize Google Drive service
    await googleDriveService.initialize();
    
    // Get file details from Google Drive
    const fileDetails = await googleDriveService.getFile(fileId);
    
    // Map Drive file to our model with additional data
    const movieData = googleDriveService.mapDriveFileToMovie(fileDetails, {
      title: title || fileDetails.name.replace(/\.[^/.]+$/, ''),
      description,
      genre: genre ? genre.split(',').map(g => g.trim()) : ['Chưa phân loại'],
      releaseYear: releaseYear || new Date().getFullYear(),
      director: director || 'Chưa cập nhật',
      actors: actors ? actors.split(',').map(a => a.trim()) : []
    });
    
    // Add additional fields
    movieData.driveFileId = fileId;
    movieData.uploadedBy = req.user.id;
    
    // Create new movie in database
    const newMovie = new Movie(movieData);
    await newMovie.save();
    
    // Create notification for all users
    const notification = new Notification({
      user: req.user.id, // Admin/Mod who imported the movie
      content: `Phim mới đã được thêm: ${movieData.title}`,
      type: 'new_movie',
      relatedMovie: newMovie._id
    });
    
    await notification.save();
    
    res.json(newMovie);
  } catch (err) {
    console.error('Error importing Google Drive movie:', err.message);
    res.status(500).json({ message: 'Lỗi khi nhập phim từ Google Drive' });
  }
});

// @route   POST api/movies/drive/auth
// @desc    Set Google Drive auth credentials
// @access  Private/Admin
router.post('/drive/auth', modAuth, async (req, res) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(400).json({ message: 'Refresh token là bắt buộc' });
    }
    
    // Initialize Google Drive service
    await googleDriveService.initialize();
    
    // Set credentials
    googleDriveService.setCredentials({
      refresh_token: refreshToken
    });
    
    // Save refresh token to environment variable
    process.env.GOOGLE_REFRESH_TOKEN = refreshToken;
    
    res.json({ message: 'Đã cấu hình xác thực Google Drive thành công' });
  } catch (err) {
    console.error('Error setting Google Drive auth:', err.message);
    res.status(500).json({ message: 'Lỗi khi cấu hình xác thực Google Drive' });
  }
});

module.exports = router;
