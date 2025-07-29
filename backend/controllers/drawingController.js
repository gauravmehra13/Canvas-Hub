const Drawing = require('../models/Drawing');
const Room = require('../models/Room');

/**
 * Save a drawing state for a room
 */
exports.saveDrawing = async (req, res) => {
  try {
    const { roomId } = req.params;
    const { lines, shapes, timestamp } = req.body;

    // Verify room exists
    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    // Create new drawing record
    const drawing = new Drawing({
      roomId,
      lines,
      shapes,
      timestamp: timestamp || new Date()
    });

    await drawing.save();

    res.status(201).json(drawing);
  } catch (error) {
    console.error('Error saving drawing:', error);
    res.status(500).json({ message: 'Failed to save drawing' });
  }
};

/**
 * Get the latest drawing state for a room
 */
exports.getLatestDrawing = async (req, res) => {
  try {
    const { roomId } = req.params;

    // Verify room exists
    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    // Get latest drawing
    const drawing = await Drawing.findOne({ roomId })
      .sort({ timestamp: -1 })
      .select('lines shapes timestamp');

    if (!drawing) {
      return res.status(404).json({ message: 'No drawings found for this room' });
    }

    res.json(drawing);
  } catch (error) {
    console.error('Error fetching drawing:', error);
    res.status(500).json({ message: 'Failed to fetch drawing' });
  }
};

/**
 * Get drawing history for a room
 */
exports.getDrawingHistory = async (req, res) => {
  try {
    const { roomId } = req.params;
    const { limit = 10 } = req.query;

    // Verify room exists
    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    // Get drawing history
    const drawings = await Drawing.find({ roomId })
      .sort({ timestamp: -1 })
      .limit(parseInt(limit))
      .select('lines shapes timestamp');

    res.json(drawings);
  } catch (error) {
    console.error('Error fetching drawing history:', error);
    res.status(500).json({ message: 'Failed to fetch drawing history' });
  }
}; 