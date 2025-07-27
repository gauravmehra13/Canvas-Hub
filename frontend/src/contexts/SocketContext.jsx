import { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext";

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const BaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  useEffect(() => {
    console.log('Auth state:', user); // Check if this is true when expected
    
    if (user) {
      const newSocket = io(BaseUrl, {
        auth: {
          token: localStorage.getItem("token"),
        },
      });

      // Add these logs
      newSocket.on('connect', () => {
        console.log('Socket connected!');
      });
      
      newSocket.on('connect_error', (error) => {
        console.log('Socket connection error:', error);
      });

      setSocket(newSocket);
      console.log('Creating new socket connection');
      return () => {
        console.log('Cleaning up socket connection');
        newSocket.disconnect();
      }
    }
  }, [user]);

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
