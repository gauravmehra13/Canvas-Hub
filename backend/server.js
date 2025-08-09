require("dotenv").config();
const express = require("express");
const http = require("http");
const connectDB = require("./config/db");
const cors = require("cors");
const socketio = require("socket.io");
const helmet = require("helmet");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const authRoutes = require("./routes/auth");
const roomRoutes = require("./routes/rooms");
const drawingRoutes = require("./routes/drawings");

const app = express();
const server = http.createServer(app);

// Middleware
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);
app.use(cookieParser());
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());

// Socket.io setup
const io = socketio(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Connect to MongoDB
connectDB();

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/rooms", drawingRoutes);

// Socket.io connection handling
require("./sockets")(io);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
