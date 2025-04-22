const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const User = require('../models/user.model');
const InviteCode = require('../models/inviteCode.model');
const config = require('../config/config');
const auth = require('../middleware/auth');

// @route   POST api/auth/register
// @desc    Register user
// @access  Public
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, inviteCode } = req.body;

    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'Người dùng đã tồn tại' });
    }

    // Validate invite code
    const inviteCodeDoc = await InviteCode.findOne({ code: inviteCode });
    if (!inviteCodeDoc) {
      return res.status(400).json({ message: 'Mã mời không hợp lệ' });
    }

    if (inviteCodeDoc.expiresAt < Date.now()) {
      return res.status(400).json({ message: 'Mã mời đã hết hạn' });
    }

    if (inviteCodeDoc.usedCount >= inviteCodeDoc.maxUses) {
      return res.status(400).json({ message: 'Mã mời đã được sử dụng hết' });
    }

    // Create new user
    user = new User({
      name,
      email,
      password
    });

    // Hash password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    await user.save();

    // Update invite code usage
    inviteCodeDoc.usedCount += 1;
    inviteCodeDoc.usedBy.push(user._id);
    await inviteCodeDoc.save();

    // Create JWT token
    const payload = {
      id: user.id,
      role: user.role
    };

    jwt.sign(
      payload,
      config.JWT_SECRET,
      { expiresIn: '7d' },
      (err, token) => {
        if (err) throw err;
        res.json({
          token,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            avatar: user.avatar
          }
        });
      }
    );
  } catch (err) {
    console.error('Error in register:', err.message);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
});

// @route   POST api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Thông tin đăng nhập không hợp lệ' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Thông tin đăng nhập không hợp lệ' });
    }

    // Create JWT token
    const payload = {
      id: user.id,
      role: user.role
    };

    jwt.sign(
      payload,
      config.JWT_SECRET,
      { expiresIn: '7d' },
      (err, token) => {
        if (err) throw err;
        res.json({
          token,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            avatar: user.avatar
          }
        });
      }
    );
  } catch (err) {
    console.error('Error in login:', err.message);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
});

// @route   GET api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    console.error('Error in get user:', err.message);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
});

// @route   GET api/auth/google
// @desc    Google OAuth login
// @access  Public
router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

// @route   GET api/auth/google/callback
// @desc    Google OAuth callback
// @access  Public
router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    // Create JWT token
    const payload = {
      id: req.user.id,
      role: req.user.role
    };

    jwt.sign(
      payload,
      config.JWT_SECRET,
      { expiresIn: '7d' },
      (err, token) => {
        if (err) throw err;
        // Redirect to frontend with token
        res.redirect(`${config.CLIENT_URL}/oauth-callback?token=${token}`);
      }
    );
  }
);

module.exports = router;
