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
    methods: ["GET", "POST"],
  },
});
//https://whiteboard-2-1h4v.onrender.com
io.on("connection", (socket) => {
  console.log("User Connected:", socket.id);
  const joinedRooms = new Set();
  socket.on("join-room", async (roomId, username) => {
    try {
      if (joinedRooms.has(roomId)) return;
      joinedRooms.add(roomId);
      await mongoose.connect(process.env.MONGO_URI);

      const userColor = `hsl(${Math.random() * 360}, 100%, 50%)`;
      const user = {
        id: socket.id,
        color: userColor,
        x: 0,
        y: 0,
        lastActive: new Date(),
        username,
      };

      await Room.findOneAndUpdate(
        { roomId },
        {
          $push: { users: user },
          $set: { lastActivity: new Date() },
        },
        { upsert: true }
      );

      socket.join(roomId);
      console.log(`🚪 User ${socket.id} (${username}) joined room ${roomId}`);
      const room = await Room.findOne({ roomId });
      if (room) {
        if (room.drawingData?.length > 0) {
          socket.emit("load-drawing-data", room.drawingData);
        }
        if (room.chatMessages?.length > 0) {
          socket.emit("load-chat-messages", room.chatMessages);
        }
        socket.emit("user-connected", room.users);
      }
      socket.to(roomId).emit("new-user-connected", user);
      const systemMessage = {
        sender: "System",
        message: `${username} joined the room`,
        timestamp: new Date(),
        senderId: "system",
        senderColor: "#ffffff",
        isSystem: true,
      };

      await Room.findOneAndUpdate(
        { roomId },
        {
          $push: { chatMessages: systemMessage },
          $set: { lastActivity: new Date() },
        }
      );
      io.to(roomId).emit("chat-message", systemMessage);
    } catch (err) {
      console.error("Error joining room:", err);
    }
  });

  socket.on("chat-message", async ({ roomId, message, username }) => {
    try {
      const room = await Room.findOne({ roomId });
      if (!room) return;

      const user = room.users.find((u) => u.id === socket.id);
      if (!user) return;

      const chatMessage = {
        sender: username,
        message,
        timestamp: new Date(),
        senderId: socket.id,
        senderColor: user.color,
        isSystem: false,
      };

      await Room.findOneAndUpdate(
        { roomId },
        {
          $push: { chatMessages: chatMessage },
          $set: { lastActivity: new Date() },
        }
      );

      io.to(roomId).emit("chat-message", chatMessage);
    } catch (err) {
      console.error("Error handling chat message:", err);
    }
  });

  socket.on("draw-move", async ({ roomId, ...drawingData }) => {
    try {
      socket.to(roomId).emit("draw-move", drawingData);

      await Room.findOneAndUpdate(
        { roomId },
        {
          $push: { drawingData: { ...drawingData, roomId } },
          $set: { lastActivity: new Date() },
        },
        { upsert: true }
      );
    } catch (err) {
      console.error("Error saving drawing:", err);
    }
  });

  socket.on("clear-canvas", async ({ roomId }) => {
    try {
      socket.to(roomId).emit("clear-canvas");
      await Room.findOneAndUpdate(
        { roomId },
        {
          $set: {
            drawingData: [],
            lastActivity: new Date(),
          },
        }
      );
    } catch (err) {
      console.error("Error clearing canvas:", err);
    }
  });

  socket.on("cursor-move", async ({ roomId, x, y }) => {
    try {
      await Room.findOneAndUpdate(
        { roomId, "users.id": socket.id },
        {
          $set: {
            "users.$.x": x,
            "users.$.y": y,
            "users.$.lastActive": new Date(),
            lastActivity: new Date(),
          },
        }
      );

      const room = await Room.findOne({ roomId });
      if (room) {
        io.to(roomId).emit("user-cursors", room.users);
      }
    } catch (err) {
      console.error("Error updating cursor position:", err);
    }
  });

  socket.on("disconnect", async () => {
    console.log("User Disconnected:", socket.id);

    try {
      const rooms = await Room.find({ "users.id": socket.id });

      for (const room of rooms) {
        const user = room.users.find((u) => u.id === socket.id);
        if (!user) continue;
        await Room.findOneAndUpdate(
          { roomId: room.roomId },
          {
            $pull: { users: { id: socket.id } },
            $set: { lastActivity: new Date() },
          }
        );
        const systemMessage = {
          sender: "System",
          message: `A user has left the room`,
          timestamp: new Date(),
          senderId: "system",
          senderColor: "#ffffff",
          isSystem: true,
        };

        await Room.findOneAndUpdate(
          { roomId: room.roomId },
          {
            $push: { chatMessages: systemMessage },
            $set: { lastActivity: new Date() },
          }
        );
        const updatedRoom = await Room.findOne({ roomId: room.roomId });
        if (updatedRoom) {
          io.to(room.roomId).emit("user-disconnected", updatedRoom.users);
          io.to(room.roomId).emit("chat-message", systemMessage);
        }
      }
    } catch (err) {
      console.error("Error handling disconnect:", err);
    }
  });
});
setInterval(async () => {
  try {
    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const result = await Room.deleteMany({ lastActivity: { $lt: cutoff } });
    if (result.deletedCount > 0) {
      console.log(`Cleaned up ${result.deletedCount} inactive rooms`);
    }
  } catch (err) {
    console.error("Error cleaning up rooms:", err);
  }
}, 12 * 60 * 60 * 1000);

server.listen(5000, () => {
  console.log("Server running on http://localhost:5000");
});
