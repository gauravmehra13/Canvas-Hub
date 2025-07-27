# 🎨 Realtime Whiteboard - MERN Stack Collaboration App

A real-time collaborative whiteboard application built with the MERN stack (MongoDB, Express.js, React, Node.js) and Socket.IO for real-time communication.

## ✨ Features

- **Real-time Collaboration**: Multiple users can draw and interact simultaneously
- **Room Management**: Create and join private/public rooms
- **Live Chat**: Built-in chat functionality for room participants
- **User Presence**: See who's currently active in the room
- **Whiteboard Tools**:
  - Drawing tools
  - Shape creation
  - Text addition
  - Undo/Redo functionality
  - Clear board option

## 🛠️ Tech Stack

### Frontend

- **React** (v19) with TypeScript
- **Socket.IO Client** for real-time communication
- **Konva.js** for canvas manipulation
- **TailwindCSS** for styling
- **Zustand** for state management
- **React Router** for navigation
- **React Hot Toast** for notifications

### Backend

- **Node.js** with Express
- **Socket.IO** for WebSocket connections
- **MongoDB** with Mongoose
- **JWT** for authentication
- **CORS** for cross-origin resource sharing

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- MongoDB installed and running
- npm or yarn package manager

### Installation

1. **Clone the repository**

```bash
git clone <your-repo-url>
cd Realtime-Whiteboard
```

2. **Backend Setup**

```bash
cd backend
npm install

# Create a .env file with:
PORT=5000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
CLIENT_URL=your_frontend_url
# Start the server
npm start
```

3. **Frontend Setup**

```bash
cd frontend
npm install

# Create a .env file with:
VITE_API_URL=http://localhost:5000 || your_deployed_backend_url

# Start the development server
npm run dev
```

## 🌟 Features in Detail

### Room Management

- Create public or private rooms
- Join rooms via unique room IDs
- Real-time user presence tracking
- Room chat functionality

### Whiteboard Features

- Free-hand drawing
- Shape creation (rectangles, circles, etc.)
- Text addition
- Undo/Redo capabilities
- Clear board functionality
- Real-time sync across all users

### User Features

- User authentication
- Active user tracking
- Join/Leave notifications
- Real-time chat in rooms

## 🔒 Environment Variables

### Backend (.env)

```
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
CLIENT_URL=your_frontend_url

```

### Frontend (.env)

```
VITE_API_URL=http://localhost:5000 || your_actual_backend_url
```
