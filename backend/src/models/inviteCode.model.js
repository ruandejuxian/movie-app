const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const InviteCodeSchema = new Schema({
  code: {
    type: String,
    required: true,
    unique: true
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  expiresAt: {
    type: Date,
    required: true
  },
  maxUses: {
    type: Number,
    default: 1
  },
  usedCount: {
    type: Number,
    default: 0
  },
  usedBy: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('InviteCode', InviteCodeSchema);
