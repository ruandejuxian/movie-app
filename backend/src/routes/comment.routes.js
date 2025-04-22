const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const modAuth = require('../middleware/modAuth');
const Comment = require('../models/comment.model');
const Movie = require('../models/movie.model');
const User = require('../models/user.model');
const Notification = require('../models/notification.model');

// @route   GET api/comments/movie/:movieId
// @desc    Get comments for a movie
// @access  Public
router.get('/movie/:movieId', async (req, res) => {
  try {
    const comments = await Comment.find({ 
      movie: req.params.movieId,
      parentComment: null 
    })
    .sort({ createdAt: -1 })
    .populate('user', 'name avatar')
    .populate({
      path: 'replies',
      populate: {
        path: 'user',
        select: 'name avatar'
      }
    });
    
    res.json(comments);
  } catch (err) {
    console.error('Error fetching comments:', err.message);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
});

// @route   POST api/comments
// @desc    Create a comment
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const { movie, content, parentComment } = req.body;
    
    // Verify movie exists
    const movieDoc = await Movie.findById(movie);
    if (!movieDoc) {
      return res.status(404).json({ message: 'Không tìm thấy phim' });
    }
    
    // Create new comment
    const newComment = new Comment({
      movie,
      user: req.user.id,
      content,
      parentComment
    });
    
    const comment = await newComment.save();
    
    // If this is a reply, add it to parent comment's replies
    if (parentComment) {
      const parentCommentDoc = await Comment.findById(parentComment);
      if (parentCommentDoc) {
        parentCommentDoc.replies.push(comment._id);
        await parentCommentDoc.save();
        
        // Create notification for comment reply
        if (parentCommentDoc.user.toString() !== req.user.id) {
          const notification = new Notification({
            user: parentCommentDoc.user,
            content: 'Có người đã trả lời bình luận của bạn',
            type: 'comment_reply',
            relatedMovie: movie,
            relatedComment: comment._id
          });
          
          await notification.save();
        }
      }
    }
    
    // Populate user info before returning
    await comment.populate('user', 'name avatar');
    
    res.json(comment);
  } catch (err) {
    console.error('Error creating comment:', err.message);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
});

// @route   PUT api/comments/:id
// @desc    Update a comment
// @access  Private
router.put('/:id', auth, async (req, res) => {
  try {
    const { content } = req.body;
    
    let comment = await Comment.findById(req.params.id);
    
    if (!comment) {
      return res.status(404).json({ message: 'Không tìm thấy bình luận' });
    }
    
    // Check user owns the comment
    if (comment.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Không có quyền chỉnh sửa bình luận này' });
    }
    
    comment.content = content;
    await comment.save();
    
    res.json(comment);
  } catch (err) {
    console.error('Error updating comment:', err.message);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
});

// @route   DELETE api/comments/:id
// @desc    Delete a comment
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    
    if (!comment) {
      return res.status(404).json({ message: 'Không tìm thấy bình luận' });
    }
    
    // Check user owns the comment or is mod/admin
    const user = await User.findById(req.user.id);
    if (comment.user.toString() !== req.user.id && user.role !== 'admin' && user.role !== 'mod') {
      return res.status(401).json({ message: 'Không có quyền xóa bình luận này' });
    }
    
    // If this is a parent comment, delete all replies
    if (!comment.parentComment) {
      await Comment.deleteMany({ parentComment: comment._id });
    } else {
      // If this is a reply, remove it from parent's replies array
      const parentComment = await Comment.findById(comment.parentComment);
      if (parentComment) {
        parentComment.replies = parentComment.replies.filter(
          reply => reply.toString() !== req.params.id
        );
        await parentComment.save();
      }
    }
    
    await comment.remove();
    
    res.json({ message: 'Đã xóa bình luận' });
  } catch (err) {
    console.error('Error deleting comment:', err.message);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
});

// @route   POST api/comments/:id/like
// @desc    Like a comment
// @access  Private
router.post('/:id/like', auth, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    
    if (!comment) {
      return res.status(404).json({ message: 'Không tìm thấy bình luận' });
    }
    
    // Check if comment already liked
    if (comment.likes.includes(req.user.id)) {
      return res.status(400).json({ message: 'Bạn đã thích bình luận này rồi' });
    }
    
    comment.likes.push(req.user.id);
    await comment.save();
    
    res.json(comment.likes);
  } catch (err) {
    console.error('Error liking comment:', err.message);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
});

// @route   POST api/comments/:id/unlike
// @desc    Unlike a comment
// @access  Private
router.post('/:id/unlike', auth, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    
    if (!comment) {
      return res.status(404).json({ message: 'Không tìm thấy bình luận' });
    }
    
    // Remove user from likes
    comment.likes = comment.likes.filter(
      like => like.toString() !== req.user.id
    );
    
    await comment.save();
    
    res.json(comment.likes);
  } catch (err) {
    console.error('Error unliking comment:', err.message);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
});

// @route   GET api/comments/user/:userId
// @desc    Get comments by user (for mod/admin)
// @access  Private/Mod
router.get('/user/:userId', modAuth, async (req, res) => {
  try {
    const comments = await Comment.find({ user: req.params.userId })
      .sort({ createdAt: -1 })
      .populate('movie', 'title')
      .populate('user', 'name avatar');
    
    res.json(comments);
  } catch (err) {
    console.error('Error fetching user comments:', err.message);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
});

module.exports = router;
