const jwt = require('jsonwebtoken');
const User = require('../models/User');

module.exports = (io) => {
  // Store active users and their rooms
  const activeUsers = new Map();
  const roomDrawings = new Map(); // Store drawings for each room
  
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
  
  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.user.username}`);
    
    // Join room
    socket.on('joinRoom', async (roomId) => {
      socket.join(roomId);
      activeUsers.set(socket.id, { 
        userId: socket.user._id, 
        username: socket.user.username, 
        roomId 
      });
      
      // Notify room about new user
      const usersInRoom = getUsersInRoom(roomId);
      io.to(roomId).emit('userJoined', {
        userId: socket.user._id,
        username: socket.user.username,
        activeUsers: usersInRoom
      });
      
      // Send current room drawings to new user
      const drawings = roomDrawings.get(roomId) || [];
      socket.emit('initDrawings', drawings);
    });
    
    // Whiteboard drawing
    socket.on('draw', (data) => {
      const userData = activeUsers.get(socket.id);
      if (!userData) return;
      
      // Store the drawing data
      const drawings = roomDrawings.get(userData.roomId) || [];
      if (data.type === 'clear') {
        roomDrawings.set(userData.roomId, []);
        // Broadcast clear to all users in the room including sender
        io.to(userData.roomId).emit('draw', {
          type: 'clear',
          timestamp: Date.now(),
          userId: userData.userId,
          username: userData.username
        });
      } else if (data.type === 'undo' || data.type === 'redo') {
        // These are handled client-side through the history state
        socket.to(userData.roomId).emit('draw', data);
      } else {
        // For shapes and lines, store the complete data
        const drawingData = {
          ...data,
          timestamp: Date.now(),
          userId: userData.userId,
          username: userData.username
        };
        drawings.push(drawingData);
        roomDrawings.set(userData.roomId, drawings);
        
        // Broadcast drawing data to all users in the room except sender
        socket.to(userData.roomId).emit('draw', drawingData);
      }
    });
    
    // Chat messages
    socket.on('sendMessage', (message) => {
      const userData = activeUsers.get(socket.id);
      if (!userData) return;
      
      io.to(userData.roomId).emit('newMessage', {
        userId: userData.userId,
        username: userData.username,
        message,
        timestamp: new Date()
      });
    });
    
    // Disconnect
    socket.on('disconnect', () => {
      const userData = activeUsers.get(socket.id);
      if (userData) {
        activeUsers.delete(socket.id);
        io.to(userData.roomId).emit('userLeft', {
          userId: userData.userId,
          username: userData.username,
          activeUsers: getUsersInRoom(userData.roomId)
        });
      }
      console.log(`User disconnected: ${socket.user.username}`);
    });
  });
  
  function getUsersInRoom(roomId) {
    const users = [];
    activeUsers.forEach((userData, socketId) => {
      if (userData.roomId === roomId) {
        users.push({
          userId: userData.userId,
          username: userData.username
        });
      }
    });
    return users;
  }
};