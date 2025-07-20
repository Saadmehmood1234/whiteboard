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
    origin: "https://whiteboard-2-1h4v.onrender.com", 
    methods: ["GET", "POST"]
  }
});
const roomUsers = {};
io.on("connection", (socket) => {
  console.log("User Connected:", socket.id);

  socket.on("join-room", async (roomId) => {
    try {
      await mongoose.connect(process.env.MONGO_URI);
    
      if (!roomUsers[roomId]) {
        roomUsers[roomId] = [];
      }
      const user = {
        id: socket.id,
        color: `hsl(${Math.random() * 360}, 100%, 50%)`,
        x: 0,
        y: 0
      };
      roomUsers[roomId].push(user);
      
      socket.join(roomId);
      console.log(`🚪 User ${socket.id} joined room ${roomId}`);
      const room = await Room.findOne({ roomId });
      if (room?.drawingData?.length > 0) {
        socket.emit("load-drawing-data", room.drawingData);
      }

      io.to(roomId).emit("user-connected", roomUsers[roomId]);
    } catch (err) {
      console.error(" Error joining room:", err);
    }
  });

  socket.on("draw-move", ({ roomId, ...drawingData }) => {
    socket.to(roomId).emit("draw-move", drawingData);

    Room.findOneAndUpdate(
      { roomId },
      { 
        $push: { drawingData },
        $set: { lastActivity: new Date() }
      },
      { upsert: true }
    ).catch(err => console.error("Error saving drawing:", err));
  });

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

  socket.on("disconnect", () => {
    console.log(" User Disconnected:", socket.id);
    Object.keys(roomUsers).forEach(roomId => {
      roomUsers[roomId] = roomUsers[roomId].filter(user => user.id !== socket.id);
      io.to(roomId).emit("user-disconnected", roomUsers[roomId]);
    });
  });
});

setInterval(() => {
  const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000); 
  Room.deleteMany({ lastActivity: { $lt: cutoff } })
    .then(result => {
      if (result.deletedCount > 0) {
        console.log(`Cleaned up ${result.deletedCount} inactive rooms`);
      }
    })
    .catch(err => console.error("Error cleaning up rooms:", err));
}, 12 * 60 * 60 * 1000); 

server.listen(5000, () => {
  console.log(" Server running on http://localhost:5000");
});