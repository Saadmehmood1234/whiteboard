const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const Room = require("./model/Room");
dotenv.config();
const app = express();
app.use(cors());
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*", 
    methods: ["GET", "POST"]
  }
});

// Track connected users per room
const roomUsers = {};
io.on("connection", (socket) => {
  console.log("User Connected:", socket.id);

  socket.on("join-room", async (roomId) => {
    try {
      await mongoose.connect(process.env.MONGO_URI);
      
      // Initialize room if it doesn't exist
      if (!roomUsers[roomId]) {
        roomUsers[roomId] = [];
      }

      // Add user to room
      const user = {
        id: socket.id,
        color: `hsl(${Math.random() * 360}, 100%, 50%)`,
        x: 0,
        y: 0
      };
      roomUsers[roomId].push(user);
      
      socket.join(roomId);
      console.log(`🚪 User ${socket.id} joined room ${roomId}`);

      // Load existing drawing data
      const room = await Room.findOne({ roomId });
      if (room?.drawingData?.length > 0) {
        socket.emit("load-drawing-data", room.drawingData);
      }

      // Notify all users in room about new connection
      io.to(roomId).emit("user-connected", roomUsers[roomId]);
    } catch (err) {
      console.error("❌ Error joining room:", err);
    }
  });

  // Handle drawing events
  socket.on("draw-move", ({ roomId, ...drawingData }) => {
    // Broadcast to other users in the room
    socket.to(roomId).emit("draw-move", drawingData);
    
    // Save to database
    Room.findOneAndUpdate(
      { roomId },
      { 
        $push: { drawingData },
        $set: { lastActivity: new Date() }
      },
      { upsert: true }
    ).catch(err => console.error("Error saving drawing:", err));
  });

  // Handle clear canvas
  socket.on("clear-canvas", ({ roomId }) => {
    socket.to(roomId).emit("clear-canvas");
    Room.findOneAndUpdate(
      { roomId },
      { 
        $set: { 
          drawingData: [],
          lastActivity: new Date() 
        }
      }
    ).catch(err => console.error("Error clearing canvas:", err));
  });

  // Handle cursor movement
  socket.on("cursor-move", ({ roomId, x, y }) => {
    if (roomUsers[roomId]) {
      const user = roomUsers[roomId].find(u => u.id === socket.id);
      if (user) {
        user.x = x;
        user.y = y;
        io.to(roomId).emit("user-cursors", roomUsers[roomId]);
      }
    }
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    console.log("❎ User Disconnected:", socket.id);
    
    // Remove user from all rooms
    Object.keys(roomUsers).forEach(roomId => {
      roomUsers[roomId] = roomUsers[roomId].filter(user => user.id !== socket.id);
      io.to(roomId).emit("user-disconnected", roomUsers[roomId]);
    });
  });
});

// Clean up inactive rooms periodically
setInterval(() => {
  const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24 hours
  Room.deleteMany({ lastActivity: { $lt: cutoff } })
    .then(result => {
      if (result.deletedCount > 0) {
        console.log(`Cleaned up ${result.deletedCount} inactive rooms`);
      }
    })
    .catch(err => console.error("Error cleaning up rooms:", err));
}, 12 * 60 * 60 * 1000); 

server.listen(5000, () => {
  console.log("🚀 Server running on http://localhost:5000");
});