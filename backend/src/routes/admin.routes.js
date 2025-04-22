const express = require('express');
const router = express.Router();
const adminAuth = require('../middleware/adminAuth');
const User = require('../models/user.model');
const Movie = require('../models/movie.model');
const Comment = require('../models/comment.model');
const InviteCode = require('../models/inviteCode.model');

// @route   GET api/admin/stats
// @desc    Get admin dashboard stats
// @access  Private/Admin
router.get('/stats', adminAuth, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalMovies = await Movie.countDocuments();
    const totalComments = await Comment.countDocuments();
    const activeInviteCodes = await InviteCode.countDocuments({
      expiresAt: { $gt: Date.now() },
      usedCount: { $lt: '$maxUses' }
    });
    
    res.json({
      totalUsers,
      totalMovies,
      totalComments,
      activeInviteCodes
    });
  } catch (err) {
    console.error('Error fetching admin stats:', err.message);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
});

// @route   GET api/admin/users
// @desc    Get all users with pagination
// @access  Private/Admin
router.get('/users', adminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    const query = {};
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    const options = {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      sort: { createdAt: -1 }
    };
    
    const users = await User.find(query)
      .select('-password')
      .sort(options.sort)
      .limit(options.limit)
      .skip((options.page - 1) * options.limit);
    
    const total = await User.countDocuments(query);
    
    res.json({
      users,
      totalPages: Math.ceil(total / options.limit),
      currentPage: options.page,
      totalUsers: total
    });
  } catch (err) {
    console.error('Error fetching users:', err.message);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
});

// @route   GET api/admin/movies
// @desc    Get all movies with pagination
// @access  Private/Admin
router.get('/movies', adminAuth, async (req, res) => {
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
    console.error('Error fetching movies:', err.message);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
});

// @route   GET api/admin/comments
// @desc    Get all comments with pagination
// @access  Private/Admin
router.get('/comments', adminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    
    const options = {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      sort: { createdAt: -1 }
    };
    
    const comments = await Comment.find()
      .sort(options.sort)
      .limit(options.limit)
      .skip((options.page - 1) * options.limit)
      .populate('user', 'name')
      .populate('movie', 'title');
    
    const total = await Comment.countDocuments();
    
    res.json({
      comments,
      totalPages: Math.ceil(total / options.limit),
      currentPage: options.page,
      totalComments: total
    });
  } catch (err) {
    console.error('Error fetching comments:', err.message);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
});

module.exports = router;
