const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const MovieSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  genre: {
    type: [String],
    required: true
  },
  releaseYear: {
    type: Number
  },
  director: {
    type: String
  },
  actors: {
    type: [String]
  },
  poster: {
    type: String
  },
  videoUrl: {
    type: String,
    required: true
  },
  source: {
    type: String,
    enum: ['api', 'google_drive'],
    required: true
  },
  rating: {
    type: Number,
    default: 0
  },
  ratingCount: {
    type: Number,
    default: 0
  },
  views: {
    type: Number,
    default: 0
  },
  uploadedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Movie', MovieSchema);
