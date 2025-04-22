const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');
const modAuth = require('../middleware/modAuth');
const InviteCode = require('../models/inviteCode.model');
const crypto = require('crypto');

// @route   GET api/invite-codes
// @desc    Get all invite codes (admin only)
// @access  Private/Admin
router.get('/', adminAuth, async (req, res) => {
  try {
    const inviteCodes = await InviteCode.find()
      .sort({ createdAt: -1 })
      .populate('createdBy', 'name email')
      .populate('usedBy', 'name email');
    
    res.json(inviteCodes);
  } catch (err) {
    console.error('Error fetching invite codes:', err.message);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
});

// @route   GET api/invite-codes/my-codes
// @desc    Get invite codes created by current user (mod/admin)
// @access  Private/Mod
router.get('/my-codes', modAuth, async (req, res) => {
  try {
    const inviteCodes = await InviteCode.find({ createdBy: req.user.id })
      .sort({ createdAt: -1 })
      .populate('usedBy', 'name email');
    
    res.json(inviteCodes);
  } catch (err) {
    console.error('Error fetching user invite codes:', err.message);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
});

// @route   POST api/invite-codes
// @desc    Create a new invite code (mod/admin)
// @access  Private/Mod
router.post('/', modAuth, async (req, res) => {
  try {
    const { maxUses = 1, expiresInDays = 7 } = req.body;
    
    // Generate random code
    const code = crypto.randomBytes(4).toString('hex');
    
    // Calculate expiration date
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiresInDays);
    
    const newInviteCode = new InviteCode({
      code,
      createdBy: req.user.id,
      expiresAt,
      maxUses
    });
    
    const inviteCode = await newInviteCode.save();
    
    res.json(inviteCode);
  } catch (err) {
    console.error('Error creating invite code:', err.message);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
});

// @route   GET api/invite-codes/:id
// @desc    Get invite code by ID (mod/admin)
// @access  Private/Mod
router.get('/:id', modAuth, async (req, res) => {
  try {
    const inviteCode = await InviteCode.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('usedBy', 'name email');
    
    if (!inviteCode) {
      return res.status(404).json({ message: 'Không tìm thấy mã mời' });
    }
    
    res.json(inviteCode);
  } catch (err) {
    console.error('Error fetching invite code:', err.message);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
});

// @route   DELETE api/invite-codes/:id
// @desc    Delete an invite code (admin only)
// @access  Private/Admin
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const inviteCode = await InviteCode.findById(req.params.id);
    
    if (!inviteCode) {
      return res.status(404).json({ message: 'Không tìm thấy mã mời' });
    }
    
    await inviteCode.remove();
    
    res.json({ message: 'Đã xóa mã mời' });
  } catch (err) {
    console.error('Error deleting invite code:', err.message);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
});

// @route   GET api/invite-codes/validate/:code
// @desc    Validate an invite code (public)
// @access  Public
router.get('/validate/:code', async (req, res) => {
  try {
    const inviteCode = await InviteCode.findOne({ code: req.params.code });
    
    if (!inviteCode) {
      return res.status(404).json({ 
        valid: false,
        message: 'Mã mời không tồn tại' 
      });
    }
    
    if (inviteCode.expiresAt < Date.now()) {
      return res.status(400).json({ 
        valid: false,
        message: 'Mã mời đã hết hạn' 
      });
    }
    
    if (inviteCode.usedCount >= inviteCode.maxUses) {
      return res.status(400).json({ 
        valid: false,
        message: 'Mã mời đã được sử dụng hết' 
      });
    }
    
    res.json({ 
      valid: true,
      message: 'Mã mời hợp lệ',
      expiresAt: inviteCode.expiresAt
    });
  } catch (err) {
    console.error('Error validating invite code:', err.message);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
});

module.exports = router;
