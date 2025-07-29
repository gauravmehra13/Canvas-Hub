const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/User');
const Room = require('../models/Room');
const Message = require('../models/Message');

module.exports = (io) => {
  // Store active users and their rooms with socket ID as key
  const activeUsers = new Map(); // socketId -> { userId, username, roomId }
  const roomDrawings = new Map();
  
  // Store room-to-sockets mapping for faster lookups
  const roomSockets = new Map(); // roomId -> Set of socketIds
  
  // Authentication middleware for sockets
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) return next(new Error('Authentication error'));
      
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);
      if (!user) return next(new Error('User not found'));
      
      socket.user = user;
      next();
    } catch (err) {
      next(new Error('Authentication error'));
    }
  });

  // Helper function to sync room's active users count with database
  const syncRoomActiveUsers = async (roomId) => {
    try {
      const socketsInRoom = roomSockets.get(roomId) || new Set();
      const room = await Room.findById(roomId);
      if (room) {
        room.activeUsers = socketsInRoom.size;
        await room.save();
      }
    } catch (error) {
      console.error('Error syncing room active users:', error);
    }
  };
  
  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.user.username}`);
    
    // Join room
    socket.on('joinRoom', async ({ roomId, password }) => {
      try {
        const room = await Room.findById(roomId);
        if (!room) {
          socket.emit('error', 'Room not found');
          return;
        }

        // Get actual count of users in room
        const socketsInRoom = roomSockets.get(roomId) || new Set();

        // Check room capacity BEFORE any join operations
        if (socketsInRoom.size > room.maxUsers +1) {
          socket.emit('error', 'Room is full');
          return;
        }

        // Check password for private rooms
        if (room.isPrivate && room.password !== password) {
          socket.emit('error', 'Invalid room password');
          return;
        }

        // Leave previous room if any
        const prevUserData = activeUsers.get(socket.id);
        if (prevUserData) {
          const prevRoomSockets = roomSockets.get(prevUserData.roomId);
          if (prevRoomSockets) {
            prevRoomSockets.delete(socket.id);
            if (prevRoomSockets.size === 0) {
              roomSockets.delete(prevUserData.roomId);
            } else {
              roomSockets.set(prevUserData.roomId, prevRoomSockets);
            }
            await syncRoomActiveUsers(prevUserData.roomId);
          }
          socket.leave(prevUserData.roomId);
        }

        // Join new room
        socket.join(roomId);
        
        // Update room-to-sockets mapping
        if (!roomSockets.has(roomId)) {
          roomSockets.set(roomId, new Set());
        }
        roomSockets.get(roomId).add(socket.id);
        
        // Update active users mapping
        activeUsers.set(socket.id, { 
          userId: socket.user._id, 
          username: socket.user.username, 
          roomId 
        });

        // Sync room's active users count
        await syncRoomActiveUsers(roomId);
        
        // Notify room about new user
        io.to(roomId).emit('userJoined', {
          userId: socket.user._id,
          username: socket.user.username,
          activeUsers: getUsersInRoom(roomId)
        });
        
        // Send current room drawings to new user
        const drawings = roomDrawings.get(roomId) || [];
        socket.emit('initDrawings', drawings);
      } catch (error) {
        console.error('Join room error:', error);
        socket.emit('error', 'Failed to join room');
      }
    });
    
    // Whiteboard drawing
    socket.on('draw', (data) => {
      const userData = activeUsers.get(socket.id);
      if (!userData) return;
      
      const drawings = roomDrawings.get(userData.roomId) || [];
      if (data.type === 'clear') {
        roomDrawings.set(userData.roomId, []);
        io.to(userData.roomId).emit('draw', {
          type: 'clear',
          timestamp: Date.now(),
          userId: userData.userId,
          username: userData.username
        });
      } else if (data.type === 'undo' || data.type === 'redo') {
        socket.to(userData.roomId).emit('draw', data);
      } else {
        const drawingData = {
          ...data,
          timestamp: Date.now(),
          userId: userData.userId,
          username: userData.username
        };
        drawings.push(drawingData);
        roomDrawings.set(userData.roomId, drawings);
        socket.to(userData.roomId).emit('draw', drawingData);
      }
    });
    
    // Chat messages
    socket.on('sendMessage', async (message) => {
      const userData = activeUsers.get(socket.id);
      if (!userData) return;

      try {
        // Create and save message to database
        const newMessage = new Message({
          roomId: userData.roomId,
          username: userData.username,
          message: message,
          timestamp: new Date()
        });
        await newMessage.save();

        // Emit to all users in room
        io.to(userData.roomId).emit('newMessage', {
          userId: userData.userId,
          username: userData.username,
          message,
          timestamp: newMessage.timestamp
        });
      } catch (error) {
        console.error('Error saving message:', error);
        socket.emit('error', 'Failed to send message');
      }
    });

    // Explicit leave room
    socket.on('leaveRoom', async (roomId) => {
      const userData = activeUsers.get(socket.id);
      if (userData && userData.roomId === roomId) {
        await handleUserLeaveRoom(socket);
      }
    });
    
    // Disconnect
    socket.on('disconnect', async () => {
      await handleUserLeaveRoom(socket);
      console.log(`User disconnected: ${socket.user.username}`);
    });
  });

  // Helper function to handle user leaving a room
  async function handleUserLeaveRoom(socket) {
    const userData = activeUsers.get(socket.id);
    if (userData) {
      const { roomId } = userData;
      
      // Remove from room-to-sockets mapping
      const roomSocketsSet = roomSockets.get(roomId);
      if (roomSocketsSet) {
        roomSocketsSet.delete(socket.id);
        if (roomSocketsSet.size === 0) {
          roomSockets.delete(roomId);
        } else {
          roomSockets.set(roomId, roomSocketsSet);
        }
      }

      // Remove from active users
      activeUsers.delete(socket.id);
      
      // Leave socket room
      socket.leave(roomId);

      // Sync room's active users count
      await syncRoomActiveUsers(roomId);

      // Notify others in room
      io.to(roomId).emit('userLeft', {
        userId: userData.userId,
        username: userData.username,
        activeUsers: getUsersInRoom(roomId)
      });
    }
  }
  
  function getUsersInRoom(roomId) {
    const users = new Set();
    const roomSocketsSet = roomSockets.get(roomId) || new Set();
    
    for (const socketId of roomSocketsSet) {
      const userData = activeUsers.get(socketId);
      if (userData) {
        users.add({
          userId: userData.userId,
          username: userData.username
        });
      }
    }
    
    return Array.from(users);
  }
};