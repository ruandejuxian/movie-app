const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const NotificationSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['new_movie', 'comment_reply', 'account_blocked', 'system'],
    required: true
  },
  read: {
    type: Boolean,
    default: false
  },
  relatedMovie: {
    type: Schema.Types.ObjectId,
    ref: 'Movie'
  },
  relatedComment: {
    type: Schema.Types.ObjectId,
    ref: 'Comment'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Notification', NotificationSchema);
