const Room = require("../models/Room");
const Message = require("../models/Message");

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
      .select("-password") // Exclude password field
      .lean(); // Convert to plain objects for better performance
    res.json(rooms);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get room by ID
exports.getRoomById = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id).select("-password"); // Exclude password field
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

// Delete room
exports.deleteRoom = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) {
      return res.status(404).json({ error: "Room not found" });
    }

    // Check if the requesting user is the creator of the room
    if (room.createdBy.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ error: "Not authorized to delete this room" });
    }

    await Room.findByIdAndDelete(req.params.id);
    res.json({ message: "Room deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get chat history for a room
exports.getChatHistory = async (req, res) => {
  try {
    const roomId = req.params.id;

    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    const messages = await Message.find({ roomId })
      .sort({ timestamp: -1 })
      .limit(parseInt(req.query.limit || 50))
      .select("username message timestamp")
      .lean();

    res.json(messages.reverse());
  } catch (error) {
    console.error("Error fetching chat history:", error);
    res.status(500).json({ message: "Failed to fetch chat history" });
  }
};
