const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Notification = require('../models/notification.model');

// @route   GET api/notifications
// @desc    Get user's notifications
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .populate('relatedMovie', 'title poster')
      .populate('relatedComment', 'content');
    
    res.json(notifications);
  } catch (err) {
    console.error('Error fetching notifications:', err.message);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
});

// @route   PUT api/notifications/:id/read
// @desc    Mark notification as read
// @access  Private
router.put('/:id/read', auth, async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    
    if (!notification) {
      return res.status(404).json({ message: 'Không tìm thấy thông báo' });
    }
    
    // Check if notification belongs to user
    if (notification.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Không có quyền truy cập' });
    }
    
    notification.read = true;
    await notification.save();
    
    res.json(notification);
  } catch (err) {
    console.error('Error marking notification as read:', err.message);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
});

// @route   PUT api/notifications/read-all
// @desc    Mark all notifications as read
// @access  Private
router.put('/read-all', auth, async (req, res) => {
  try {
    await Notification.updateMany(
      { user: req.user.id, read: false },
      { $set: { read: true } }
    );
    
    res.json({ message: 'Đã đánh dấu tất cả thông báo là đã đọc' });
  } catch (err) {
    console.error('Error marking all notifications as read:', err.message);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
});

// @route   DELETE api/notifications/:id
// @desc    Delete a notification
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    
    if (!notification) {
      return res.status(404).json({ message: 'Không tìm thấy thông báo' });
    }
    
    // Check if notification belongs to user
    if (notification.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Không có quyền truy cập' });
    }
    
    await notification.remove();
    
    res.json({ message: 'Đã xóa thông báo' });
  } catch (err) {
    console.error('Error deleting notification:', err.message);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
});

// @route   DELETE api/notifications
// @desc    Delete all notifications
// @access  Private
router.delete('/', auth, async (req, res) => {
  try {
    await Notification.deleteMany({ user: req.user.id });
    
    res.json({ message: 'Đã xóa tất cả thông báo' });
  } catch (err) {
    console.error('Error deleting all notifications:', err.message);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
});

// @route   POST api/notifications
// @desc    Create a notification (for system use)
// @access  Private/Admin
router.post('/', auth, async (req, res) => {
  try {
    const { user, content, type, relatedMovie, relatedComment } = req.body;
    
    const notification = new Notification({
      user,
      content,
      type,
      relatedMovie,
      relatedComment
    });
    
    await notification.save();
    
    res.json(notification);
  } catch (err) {
    console.error('Error creating notification:', err.message);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
});

module.exports = router;
