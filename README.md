# 🎨 CanvasHub - MERN Stack Collaboration App

A real-time collaborative whiteboard application built with the MERN stack (MongoDB, Express.js, React, Node.js) and Socket.IO for real-time communication.

## 📸 Product Screenshots

![Room Management](/frontend/public/project_images/1.png)
![Live Collaboration](/frontend/public/project_images/2.png)

## ✨ Features

- **Real-time Collaboration**: Multiple users can draw and interact on the whiteboard at the same time
- **Room Management**: Easily create and join both private and public rooms
- **Live Chat**: Communicate instantly with other participants in each room
- **User Presence**: See which users are currently active in your room
- **Whiteboard Tools**:
  - Freehand drawing tools
  - Shape creation (rectangles, circles, arrows, and more)
  - Add text directly on the canvas
  - Undo and redo your actions
  - Clear the entire board with one click
- **Persistent Whiteboard & Chat**: All drawings and conversations are automatically saved and securely persisted, so you never lose your work. You can also manually save your whiteboard at any time for extra peace of mind.

## 🛠️ Tech Stack

### Frontend

- **React** (v19)
- **Socket.IO Client** for real-time communication
- **Konva.js** for canvas manipulation
- **TailwindCSS** for styling
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
cd Canvas-Hub
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
NODE_ENV=production/development
# Start the server
npm start
```

3. **Frontend Setup**

```bash
cd frontend
npm install

# Create a .env file with:
VITE_API_URL=http://localhost:5000 or your_deployed_backend_url

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
