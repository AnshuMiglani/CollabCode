const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const setupPty = require("./ptyServer");
require("dotenv").config();

const app = express();

const CLIENT_ORIGINS = [
  process.env.CLIENT_URL,
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:3000",
  "https://collab-code-self.vercel.app",
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // allow all local or defined origins
    if (!origin || CLIENT_ORIGINS.includes(origin) || origin.startsWith("http://localhost:")) {
      return callback(null, true);
    }
    return callback(null, true); // permissive for collaborative dev
  },
  methods: ["GET", "POST"],
  credentials: true
}));

app.use(express.json());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  },
  transports: ["polling", "websocket"]
});

// Map<roomId, RoomState>
const rooms = new Map();

// Attach Terminal PTY Server safely
try {
  setupPty(io);
} catch (ptyErr) {
  console.warn("Terminal PTY setup warning:", ptyErr.message);
}

// Health check route
app.get("/", (req, res) => {
  res.json({
    status: "online",
    service: "CollabCode Real-Time Engine",
    activeRooms: rooms.size,
    timestamp: new Date().toISOString()
  });
});

// Local Code Runner Fallback Endpoint
const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");
const os = require("os");

app.post("/api/run", (req, res) => {
  const { language, code, stdin = "" } = req.body;
  if (!code) {
    return res.status(400).json({ error: "Code content required" });
  }

  const startTime = Date.now();
  const tempDir = os.tmpdir();
  const fileId = "collab_" + Date.now() + "_" + Math.random().toString(36).substring(2, 6);

  let cmd = "";
  let args = [];
  let tempFilePath = null;

  if (language === "javascript" || language === "js") {
    cmd = "node";
    args = ["-e", code];
  } else if (language === "python" || language === "py") {
    tempFilePath = path.join(tempDir, `${fileId}.py`);
    fs.writeFileSync(tempFilePath, code);
    cmd = process.platform === "win32" ? "python" : "python3";
    args = [tempFilePath];
  } else {
    return res.status(400).json({
      error: `Local execution for ${language} requires local compiler. Please use Judge0 cloud runner or interactive terminal.`
    });
  }

  try {
    const child = spawn(cmd, args, { timeout: 10000 });
    let stdout = "";
    let stderr = "";

    if (stdin) {
      child.stdin.write(stdin);
      child.stdin.end();
    }

    child.stdout.on("data", (d) => { stdout += d.toString(); });
    child.stderr.on("data", (d) => { stderr += d.toString(); });

    child.on("close", (exitCode) => {
      if (tempFilePath && fs.existsSync(tempFilePath)) {
        try { fs.unlinkSync(tempFilePath); } catch (e) {}
      }
      const time = Date.now() - startTime;
      res.json({ stdout, stderr, exitCode: exitCode ?? 0, time });
    });

    child.on("error", (err) => {
      if (tempFilePath && fs.existsSync(tempFilePath)) {
        try { fs.unlinkSync(tempFilePath); } catch (e) {}
      }
      res.json({ stdout, stderr: err.message, exitCode: 1, time: Date.now() - startTime });
    });
  } catch (err) {
    if (tempFilePath && fs.existsSync(tempFilePath)) {
      try { fs.unlinkSync(tempFilePath); } catch (e) {}
    }
    res.status(500).json({ error: err.message });
  }
});

const USER_COLORS = [
  "#38bdf8", // Sky blue
  "#f43f5e", // Rose
  "#10b981", // Emerald
  "#f59e0b", // Amber
  "#a855f7", // Purple
  "#ec4899", // Pink
  "#06b6d4", // Cyan
  "#84cc16", // Lime
  "#6366f1", // Indigo
  "#14b8a6", // Teal
];

const DEFAULT_FILES = {
  "main.js": {
    name: "main.js",
    language: "javascript",
    content: `// ⚡ CollabCode Real-Time Synchronous Workspace
function calculateMetrics(items) {
  return items.reduce((acc, curr) => acc + curr.score, 0);
}

const testData = [
  { id: 1, name: "Alpha", score: 92 },
  { id: 2, name: "Beta", score: 88 },
  { id: 3, name: "Gamma", score: 95 }
];

console.log("CollabCode Workspace Ready!");
console.log("Total Score:", calculateMetrics(testData));
`,
  },
  "index.html": {
    name: "index.html",
    language: "html",
    content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>CollabCode Web Preview</title>
  <style>
    body {
      margin: 0;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background: radial-gradient(circle at 50% 50%, #171923 0%, #090a0f 100%);
      font-family: system-ui, -apple-system, sans-serif;
      color: #f8fafc;
    }
    .card {
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(16px);
      padding: 2.5rem;
      border-radius: 1.25rem;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
      text-align: center;
      max-width: 420px;
    }
    h1 {
      margin-top: 0;
      background: linear-gradient(135deg, #38bdf8, #818cf8);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    p { color: #94a3b8; line-height: 1.6; }
    button {
      background: #38bdf8;
      color: #090a0f;
      border: none;
      font-weight: 700;
      padding: 0.75rem 1.5rem;
      border-radius: 0.5rem;
      cursor: pointer;
      transition: transform 0.15s ease;
    }
    button:hover { transform: scale(1.04); }
  </style>
</head>
<body>
  <div class="card">
    <h1>CollabCode Live</h1>
    <p>Edit this file and click <strong>Web Preview</strong> to see real-time updates.</p>
    <button onclick="alert('Hello from CollabCode interactive preview!')">Interact</button>
  </div>
</body>
</html>`,
  },
  "styles.css": {
    name: "styles.css",
    language: "css",
    content: `/* Global styles */
* {
  box-sizing: border-box;
}

body {
  font-family: 'Inter', sans-serif;
  color: #f8fafc;
  background-color: #090a0f;
}
`,
  }
};

// getOrCreateRoom initializes room with default files and creator

function getOrCreateRoom(roomId, creatorUsername) {
  if (!rooms.has(roomId)) {
    rooms.set(roomId, {
      id: roomId,
      creator: creatorUsername,
      createdAt: Date.now(),
      files: JSON.parse(JSON.stringify(DEFAULT_FILES)),
      users: new Map(), // socketId -> User
      messages: [
        {
          id: "sys-welcome",
          user: "CollabCode Bot",
          color: "#38bdf8",
          text: `Welcome to room ${roomId.slice(0, 8)}! Real-time synchronization is active.`,
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          isSystem: true
        }
      ]
    });
  }
  return rooms.get(roomId);
}

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  // 1. Join Room
  socket.on("join-room", (roomId, username) => {
    if (!roomId || !username) return;

    socket.join(roomId);
    socket.data.roomId = roomId;
    socket.data.username = username;

    const room = getOrCreateRoom(roomId, username);

    // Pick consistent color for this user
    const userIndex = room.users.size % USER_COLORS.length;
    const userColor = USER_COLORS[userIndex];
    socket.data.color = userColor;

    const userData = {
      id: socket.id,
      username,
      color: userColor,
      activeFile: Object.keys(room.files)[0] || "main.js",
      cursor: null,
      isCreator: room.creator === username
    };

    room.users.set(socket.id, userData);

    // Send full synchronous room state to joining client
    socket.emit("sync-room-state", {
      roomId,
      creator: room.creator,
      files: room.files,
      users: Array.from(room.users.values()),
      messages: room.messages,
      self: userData
    });

    // Notify others in room
    const joinMsg = {
      id: "sys-" + Date.now(),
      user: "System",
      color: "#94a3b8",
      text: `${username} joined the session`,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      isSystem: true
    };
    room.messages.push(joinMsg);

    socket.to(roomId).emit("user-joined", {
      user: userData,
      users: Array.from(room.users.values()),
      message: joinMsg
    });

    io.to(roomId).emit("participants-update", Array.from(room.users.values()));
  });

  // 2. Synchronous Code Change
  socket.on("code-change", ({ roomId, fileName, code }) => {
    if (!roomId || !fileName || code === undefined) return;
    const room = rooms.get(roomId);
    if (!room) return;

    if (room.files[fileName]) {
      room.files[fileName].content = code;
    } else {
      room.files[fileName] = { name: fileName, language: "javascript", content: code };
    }

    // Broadcast only to peers in this room
    socket.to(roomId).emit("code-update", {
      fileName,
      code,
      updatedBy: socket.data.username || "Anonymous"
    });
  });

  // 3. Remote Cursor & Selection Position
  socket.on("cursor-move", ({ roomId, fileName, cursor, selection }) => {
    if (!roomId) return;
    const room = rooms.get(roomId);
    if (!room) return;

    const user = room.users.get(socket.id);
    if (user) {
      user.activeFile = fileName;
      user.cursor = cursor;
    }

    socket.to(roomId).emit("remote-cursor-update", {
      socketId: socket.id,
      username: socket.data.username,
      color: socket.data.color || "#38bdf8",
      fileName,
      cursor,
      selection
    });
  });

  // 4. File Operations (Create, Rename, Delete)
  socket.on("file-create", ({ roomId, file }) => {
    if (!roomId || !file || !file.name) return;
    const room = rooms.get(roomId);
    if (!room) return;

    room.files[file.name] = {
      name: file.name,
      language: file.language || "javascript",
      content: file.content || ""
    };

    const sysMsg = {
      id: "sys-" + Date.now(),
      user: "System",
      color: "#94a3b8",
      text: `${socket.data.username || "Someone"} created ${file.name}`,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      isSystem: true
    };
    room.messages.push(sysMsg);

    io.to(roomId).emit("file-created", {
      file: room.files[file.name],
      createdBy: socket.data.username,
      files: room.files,
      message: sysMsg
    });
  });

  socket.on("file-rename", ({ roomId, oldName, newName, language }) => {
    if (!roomId || !oldName || !newName) return;
    const room = rooms.get(roomId);
    if (!room || !room.files[oldName]) return;

    const existingFile = room.files[oldName];
    delete room.files[oldName];
    room.files[newName] = {
      ...existingFile,
      name: newName,
      language: language || existingFile.language
    };

    io.to(roomId).emit("file-renamed", {
      oldName,
      newName,
      language: language || existingFile.language,
      files: room.files
    });
  });

  socket.on("file-delete", ({ roomId, fileName }) => {
    if (!roomId || !fileName) return;
    const room = rooms.get(roomId);
    if (!room || !room.files[fileName]) return;

    // Do not delete if it is the only remaining file
    if (Object.keys(room.files).length <= 1) return;

    delete room.files[fileName];

    io.to(roomId).emit("file-deleted", {
      fileName,
      deletedBy: socket.data.username,
      files: room.files
    });
  });

  // 5. In-Room Chat Messaging
  socket.on("send-chat-message", ({ roomId, text }) => {
    if (!roomId || !text || !text.trim()) return;
    const room = rooms.get(roomId);
    if (!room) return;

    const newMsg = {
      id: "msg-" + Date.now() + "-" + Math.random().toString(36).substr(2, 4),
      user: socket.data.username || "Anonymous",
      color: socket.data.color || "#38bdf8",
      text: text.trim(),
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      isSystem: false
    };

    room.messages.push(newMsg);
    if (room.messages.length > 200) room.messages.shift();

    io.to(roomId).emit("chat-message", newMsg);
  });

  // 6. User Typing Status
  socket.on("user-typing", ({ roomId, fileName, isTyping }) => {
    if (!roomId) return;
    socket.to(roomId).emit("user-typing-update", {
      username: socket.data.username,
      fileName,
      isTyping
    });
  });

  // 7. Kick User (Host Only)
  socket.on("kick-user", ({ roomId, username }) => {
    if (!roomId || !username) return;
    const room = rooms.get(roomId);
    if (!room) return;

    // Verify requesting socket is creator
    if (room.creator !== socket.data.username) return;

    const targetEntry = Array.from(room.users.entries()).find(
      ([, u]) => u.username === username
    );

    if (targetEntry) {
      const [targetSocketId] = targetEntry;
      io.to(targetSocketId).emit("kicked");
      room.users.delete(targetSocketId);

      const kickMsg = {
        id: "sys-" + Date.now(),
        user: "System",
        color: "#ef4444",
        text: `${username} was removed by the host`,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        isSystem: true
      };
      room.messages.push(kickMsg);

      io.to(roomId).emit("participants-update", Array.from(room.users.values()));
      io.to(roomId).emit("chat-message", kickMsg);
    }
  });

  // 8. Disconnect
  socket.on("disconnect", () => {
    const { roomId, username } = socket.data;
    if (roomId && rooms.has(roomId)) {
      const room = rooms.get(roomId);
      room.users.delete(socket.id);

      // Tell peers to remove this user's cursor
      socket.to(roomId).emit("remote-cursor-remove", { socketId: socket.id });

      const leaveMsg = {
        id: "sys-" + Date.now(),
        user: "System",
        color: "#94a3b8",
        text: `${username || "A user"} left the session`,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        isSystem: true
      };
      room.messages.push(leaveMsg);

      socket.to(roomId).emit("user-left", {
        username,
        socketId: socket.id,
        users: Array.from(room.users.values()),
        message: leaveMsg
      });

      socket.to(roomId).emit("participants-update", Array.from(room.users.values()));

      // Clean up empty room after 30 minutes of inactivity
      if (room.users.size === 0) {
        setTimeout(() => {
          if (rooms.has(roomId) && rooms.get(roomId).users.size === 0) {
            rooms.delete(roomId);
            console.log(`Cleaned up inactive room: ${roomId}`);
          }
        }, 30 * 60 * 1000);
      }
    }
    console.log("Client disconnected:", username || socket.id);
  });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`🚀 CollabCode Engine running on port ${PORT}`);
});