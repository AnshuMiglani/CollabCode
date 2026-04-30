const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
require("dotenv").config();
// ✅ CORS (no trailing slash)
app.use(cors({
  origin: process.env.CLIENT_URL,
  methods: ["GET", "POST"],
  credentials: true
}));

const server = http.createServer(app);

// ✅ Socket CORS
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL,
    methods: ["GET", "POST"]
  },
});

// ✅ Health check route (important)
app.get("/", (req, res) => {
  res.send("Server is running 🚀");
});

const roomCode = {};
const roomUsers = {}; // track participants

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("join-room", (roomId, username) => {
    socket.join(roomId);
    socket.data.roomId = roomId;
    socket.data.username = username;

    if (!roomUsers[roomId]) roomUsers[roomId] = {};
    roomUsers[roomId][socket.id] = username;

    // Send existing code
    if (roomCode[roomId]) socket.emit("load-code", roomCode[roomId]);

    // Broadcast updated participants list
    io.to(roomId).emit("participants-update", Object.values(roomUsers[roomId]));
  });

  socket.on("code-change", ({ roomId, code }) => {
    roomCode[roomId] = code;
    socket.to(roomId).emit("code-update", code);
  });

  socket.on("kick-user", ({ roomId, username }) => {
  // Find socket id of target user and disconnect them
  const targetId = Object.entries(roomUsers[roomId] || {})
    .find(([, name]) => name === username)?.[0];
  if (targetId) {
    io.to(targetId).emit("kicked");
    delete roomUsers[roomId][targetId];
    io.to(roomId).emit("participants-update", Object.values(roomUsers[roomId]));
  }
});

  socket.on("disconnect", () => {
    const { roomId, username } = socket.data;
    if (roomId && roomUsers[roomId]) {
      delete roomUsers[roomId][socket.id];
      io.to(roomId).emit("participants-update", Object.values(roomUsers[roomId]));
    }
    console.log("Disconnected:", username);
  });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});