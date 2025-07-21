const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema({
  roomId: {
    type: String,
    required: true,
    unique: true
  },
  drawingData: {
    type: Array,
    default: []
  },
  chatMessages: [{
    sender: String,
    message: String,
    timestamp: {
      type: Date,
      default: Date.now
    },
    senderId: String,
    senderColor: String,
    isSystem: {
      type: Boolean,
      default: false
    }
  }],
  users: [{
    id: String,
    color: String,
    x: Number,
    y: Number,
    lastActive: {
      type: Date,
      default: Date.now
    }
  }],
  lastActivity: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Room", roomSchema);