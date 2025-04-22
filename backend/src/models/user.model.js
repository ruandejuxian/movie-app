const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String
  },
  googleId: {
    type: String
  },
  avatar: {
    type: String
  },
  role: {
    type: String,
    enum: ['admin', 'mod', 'user'],
    default: 'user'
  },
  inviteCode: {
    type: String
  },
  favorites: [{
    type: Schema.Types.ObjectId,
    ref: 'Movie'
  }],
  watchHistory: [{
    movie: {
      type: Schema.Types.ObjectId,
      ref: 'Movie'
    },
    watchedAt: {
      type: Date,
      default: Date.now
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('User', UserSchema);
