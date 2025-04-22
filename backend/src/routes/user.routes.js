const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');
const modAuth = require('../middleware/modAuth');
const User = require('../models/user.model');
const Movie = require('../models/movie.model');
const bcrypt = require('bcryptjs');

// @route   GET api/users
// @desc    Get all users (admin only)
// @access  Private/Admin
router.get('/', adminAuth, async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    console.error('Error fetching users:', err.message);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
});

// @route   GET api/users/profile
// @desc    Get current user profile
// @access  Private
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }
    res.json(user);
  } catch (err) {
    console.error('Error fetching profile:', err.message);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
});

// @route   PUT api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', auth, async (req, res) => {
  try {
    const { name, currentPassword, newPassword } = req.body;
    
    // Build update object
    const updateFields = {};
    if (name) updateFields.name = name;
    
    // If user wants to change password
    if (newPassword) {
      // Verify current password
      const user = await User.findById(req.user.id);
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      
      if (!isMatch) {
        return res.status(400).json({ message: 'Mật khẩu hiện tại không đúng' });
      }
      
      // Hash new password
      const salt = await bcrypt.genSalt(10);
      updateFields.password = await bcrypt.hash(newPassword, salt);
    }
    
    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updateFields },
      { new: true }
    ).select('-password');
    
    res.json(updatedUser);
  } catch (err) {
    console.error('Error updating profile:', err.message);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
});

// @route   GET api/users/favorites
// @desc    Get user's favorite movies
// @access  Private
router.get('/favorites', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('favorites');
    res.json(user.favorites);
  } catch (err) {
    console.error('Error fetching favorites:', err.message);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
});

// @route   POST api/users/favorites/:id
// @desc    Add movie to favorites
// @access  Private
router.post('/favorites/:id', auth, async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) {
      return res.status(404).json({ message: 'Không tìm thấy phim' });
    }
    
    const user = await User.findById(req.user.id);
    
    // Check if movie is already in favorites
    if (user.favorites.includes(req.params.id)) {
      return res.status(400).json({ message: 'Phim đã có trong danh sách yêu thích' });
    }
    
    // Add to favorites
    user.favorites.push(req.params.id);
    await user.save();
    
    res.json(user.favorites);
  } catch (err) {
    console.error('Error adding to favorites:', err.message);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
});

// @route   DELETE api/users/favorites/:id
// @desc    Remove movie from favorites
// @access  Private
router.delete('/favorites/:id', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    // Remove from favorites
    user.favorites = user.favorites.filter(
      movieId => movieId.toString() !== req.params.id
    );
    
    await user.save();
    
    res.json(user.favorites);
  } catch (err) {
    console.error('Error removing from favorites:', err.message);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
});

// @route   GET api/users/check-favorite/:id
// @desc    Check if movie is in user's favorites
// @access  Private
router.get('/check-favorite/:id', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const isFavorite = user.favorites.includes(req.params.id);
    
    res.json({ isFavorite });
  } catch (err) {
    console.error('Error checking favorite:', err.message);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
});

// @route   GET api/users/watch-history
// @desc    Get user's watch history
// @access  Private
router.get('/watch-history', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate({
      path: 'watchHistory.movie',
      select: 'title poster genre releaseYear rating'
    });
    
    // Sort by most recent
    const sortedHistory = user.watchHistory.sort((a, b) => 
      new Date(b.watchedAt) - new Date(a.watchedAt)
    );
    
    res.json(sortedHistory);
  } catch (err) {
    console.error('Error fetching watch history:', err.message);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
});

// @route   POST api/users/watch-history/:id
// @desc    Add movie to watch history
// @access  Private
router.post('/watch-history/:id', auth, async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) {
      return res.status(404).json({ message: 'Không tìm thấy phim' });
    }
    
    const user = await User.findById(req.user.id);
    
    // Check if movie is already in watch history
    const existingEntry = user.watchHistory.find(
      entry => entry.movie.toString() === req.params.id
    );
    
    if (existingEntry) {
      // Update watched time
      existingEntry.watchedAt = Date.now();
    } else {
      // Add to watch history
      user.watchHistory.push({
        movie: req.params.id,
        watchedAt: Date.now()
      });
    }
    
    await user.save();
    
    res.json(user.watchHistory);
  } catch (err) {
    console.error('Error adding to watch history:', err.message);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
});

// @route   DELETE api/users/watch-history
// @desc    Clear watch history
// @access  Private
router.delete('/watch-history', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    // Clear watch history
    user.watchHistory = [];
    await user.save();
    
    res.json({ message: 'Đã xóa lịch sử xem' });
  } catch (err) {
    console.error('Error clearing watch history:', err.message);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
});

// @route   PUT api/users/:id/role
// @desc    Update user role (admin only)
// @access  Private/Admin
router.put('/:id/role', adminAuth, async (req, res) => {
  try {
    const { role } = req.body;
    
    // Validate role
    if (!['admin', 'mod', 'user'].includes(role)) {
      return res.status(400).json({ message: 'Vai trò không hợp lệ' });
    }
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { $set: { role } },
      { new: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }
    
    res.json(user);
  } catch (err) {
    console.error('Error updating user role:', err.message);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
});

// @route   DELETE api/users/:id
// @desc    Delete user (admin only)
// @access  Private/Admin
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }
    
    await user.remove();
    
    res.json({ message: 'Đã xóa người dùng' });
  } catch (err) {
    console.error('Error deleting user:', err.message);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
});

// @route   PUT api/users/:id/block
// @desc    Block/unblock user (mod/admin)
// @access  Private/Mod
router.put('/:id/block', modAuth, async (req, res) => {
  try {
    const { blocked, duration } = req.body;
    
    const updateFields = { blocked };
    
    // If blocking user, set block duration
    if (blocked && duration) {
      const blockUntil = new Date();
      blockUntil.setDate(blockUntil.getDate() + duration);
      updateFields.blockUntil = blockUntil;
    } else if (!blocked) {
      updateFields.blockUntil = null;
    }
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { $set: updateFields },
      { new: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }
    
    res.json(user);
  } catch (err) {
    console.error('Error blocking/unblocking user:', err.message);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
});

module.exports = router;
