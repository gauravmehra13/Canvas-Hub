import { useState, useEffect } from 'react';
import { useSocket } from '../contexts/SocketContext';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

export const useRoom = (roomId) => {
  const socket = useSocket();
  const { user } = useAuth();
  const [activeUsers, setActiveUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [canvasData, setCanvasData] = useState([]);

  useEffect(() => {
    if (!socket || !roomId) return;

    const handleUserJoined = (data) => {
      if (data.username && data.userId !== user?.id) {
        toast(`${data.username} joined the room`, {
          icon: '👋',
          id: `join-${data.userId}`
        });
      }
      setActiveUsers(data.activeUsers);
    };

    const handleUserLeft = (data) => {
      if (data.username && data.userId !== user?.id) {
        toast(`${data.username} left the room`, {
          icon: '👋',
          id: `leave-${data.userId}`
        });
      }
      setActiveUsers(data.activeUsers);
    };

    const handleNewMessage = (message) => {
      setMessages(prev => [...prev, message]);
    };

    const handleDraw = (data) => {
      setCanvasData(prev => [...prev, data]);
    };

    const handleInitDrawings = (drawings) => {
      setCanvasData(drawings);
    };

    socket.on('userJoined', handleUserJoined);
    socket.on('userLeft', handleUserLeft);
    socket.on('newMessage', handleNewMessage);
    socket.on('draw', handleDraw);
    socket.on('initDrawings', handleInitDrawings);

    return () => {
      socket.off('userJoined', handleUserJoined);
      socket.off('userLeft', handleUserLeft);
      socket.off('newMessage', handleNewMessage);
      socket.off('draw', handleDraw);
      socket.off('initDrawings', handleInitDrawings);
    };
  }, [socket, roomId, user?.id]);

  const sendMessage = (message) => {
    socket?.emit('sendMessage', message);
  };

  const sendDrawing = (data) => {
    socket?.emit('draw', data);
  };

  const leaveRoom = () => {
    socket?.emit('leaveRoom', roomId);
  };

  return {
    activeUsers,
    messages,
    canvasData,
    sendMessage,
    sendDrawing,
    leaveRoom
  };
};