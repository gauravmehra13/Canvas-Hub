const express = require('express');
const auth = require('../middleware/auth');
const Room = require('../models/Room');
const router = express.Router();

// Create a room
router.post('/', auth, async (req, res) => {
  try {
    const { name } = req.body;
    const room = new Room({
      name,
      createdBy: req.user.id
    });
    await room.save();
    res.status(201).json(room);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get all rooms
router.get('/', auth, async (req, res) => {
  try {
    const rooms = await Room.find({ isActive: true });
    res.json(rooms);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get room by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) return res.status(404).json({ error: 'Room not found' });
    res.json(room);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;