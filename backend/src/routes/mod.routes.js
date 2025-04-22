const express = require('express');
const router = express.Router();
const modAuth = require('../middleware/modAuth');
const Movie = require('../models/movie.model');
const User = require('../models/user.model');
const Comment = require('../models/comment.model');

// @route   GET api/mod/stats
// @desc    Get mod dashboard stats
// @access  Private/Mod
router.get('/stats', modAuth, async (req, res) => {
  try {
    const totalMovies = await Movie.countDocuments();
    const totalComments = await Comment.countDocuments();
    
    // Get pending comments (for example, newest comments that might need moderation)
    const pendingComments = await Comment.countDocuments({
      createdAt: { $gt: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Last 24 hours
    });
    
    // Get recent users
    const recentUsers = await User.countDocuments({
      createdAt: { $gt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } // Last 7 days
    });
    
    res.json({
      totalMovies,
      totalComments,
      pendingComments,
      recentUsers
    });
  } catch (err) {
    console.error('Error fetching mod stats:', err.message);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
});

// @route   GET api/mod/movies
// @desc    Get all movies with pagination (for mod)
// @access  Private/Mod
router.get('/movies', modAuth, async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    const query = {};
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    const options = {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      sort: { createdAt: -1 }
    };
    
    const movies = await Movie.find(query)
      .sort(options.sort)
      .limit(options.limit)
      .skip((options.page - 1) * options.limit)
      .populate('uploadedBy', 'name');
    
    const total = await Movie.countDocuments(query);
    
    res.json({
      movies,
      totalPages: Math.ceil(total / options.limit),
      currentPage: options.page,
      totalMovies: total
    });
  } catch (err) {
    console.error('Error fetching movies for mod:', err.message);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
});

// @route   GET api/mod/comments
// @desc    Get all comments with pagination (for mod)
// @access  Private/Mod
router.get('/comments', modAuth, async (req, res) => {
  try {
    const { page = 1, limit = 10, recent = false } = req.query;
    const query = {};
    
    if (recent) {
      query.createdAt = { $gt: new Date(Date.now() - 24 * 60 * 60 * 1000) }; // Last 24 hours
    }
    
    const options = {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      sort: { createdAt: -1 }
    };
    
    const comments = await Comment.find(query)
      .sort(options.sort)
      .limit(options.limit)
      .skip((options.page - 1) * options.limit)
      .populate('user', 'name email')
      .populate('movie', 'title');
    
    const total = await Comment.countDocuments(query);
    
    res.json({
      comments,
      totalPages: Math.ceil(total / options.limit),
      currentPage: options.page,
      totalComments: total
    });
  } catch (err) {
    console.error('Error fetching comments for mod:', err.message);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
});

// @route   GET api/mod/users
// @desc    Get recent users (for mod)
// @access  Private/Mod
router.get('/users', modAuth, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    
    const options = {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      sort: { createdAt: -1 }
    };
    
    const users = await User.find()
      .select('-password')
      .sort(options.sort)
      .limit(options.limit)
      .skip((options.page - 1) * options.limit);
    
    const total = await User.countDocuments();
    
    res.json({
      users,
      totalPages: Math.ceil(total / options.limit),
      currentPage: options.page,
      totalUsers: total
    });
  } catch (err) {
    console.error('Error fetching users for mod:', err.message);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
});

module.exports = router;
