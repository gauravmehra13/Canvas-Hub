const Room = require('../models/Room');

// Create a room
exports.createRoom = async (req, res) => {
  try {
    const { name, isPrivate, password, maxUsers } = req.body;
    const room = new Room({
      name,
      isPrivate,
      password,
      maxUsers,
      createdBy: req.user.id,
    });
    await room.save();

    // Don't send password in response
    const roomResponse = room.toObject();
    delete roomResponse.password;
    res.status(201).json(roomResponse);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get all rooms
exports.getAllRooms = async (req, res) => {
  try {
    const rooms = await Room.find({ isActive: true })
      .select('-password') // Exclude password field
      .lean(); // Convert to plain objects for better performance
    res.json(rooms);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get room by ID
exports.getRoomById = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id)
      .select('-password'); // Exclude password field
    if (!room) return res.status(404).json({ error: "Room not found" });
    res.json(room);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Leave room
exports.leaveRoom = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) {
      return res.status(404).json({ error: "Room not found" });
    }

    if (room.activeUsers > 0) {
      room.activeUsers -= 1;
      await room.save();
    }

    res.json({ message: "Left room successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}; 