const mongoose = require('mongoose');

const drawingSchema = new mongoose.Schema({
  roomId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
    required: true
  },
  lines: [{
    type: {
      type: String,
      required: true
    },
    tool: String,
    points: [Number],
    strokeWidth: Number,
    stroke: String,
    tension: Number,
    lineCap: String,
    lineJoin: String,
    globalCompositeOperation: String
  }],
  shapes: [{
    type: {
      type: String,
      required: true
    },
    x: Number,
    y: Number,
    width: Number,
    height: Number,
    radius: Number,
    points: [Number],
    stroke: String,
    strokeWidth: Number,
    fill: String,
    pointerLength: Number,
    pointerWidth: Number,
    text: String,
    fontSize: Number
  }],
  timestamp: {
    type: Date,
    default: Date.now
  }
});

// Index for faster queries
drawingSchema.index({ roomId: 1, timestamp: -1 });

module.exports = mongoose.model('Drawing', drawingSchema); 