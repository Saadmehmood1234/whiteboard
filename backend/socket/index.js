const Room = require('../model/Room');
const mongoose = require('mongoose');

module.exports = (socket, io) => {
  console.log("✅ User Connected:", socket.id);

  socket.on("join-room", async (roomId) => {
    try {
      await mongoose.connect(process.env.MONGO_URI);

      let room = await Room.findOne({ roomId });

      if (!room) {
        try {
          room = new Room({ roomId, drawingData: [] });
          await room.save();
          console.log(`🆕 Room created: ${roomId}`);
        } catch (error) {
          if (error.code === 11000) {
            // Duplicate key error (someone else created it just now)
            console.log(`⚠️ Room ${roomId} already created by another user.`);
          } else {
            throw error;
          }
        }
      }

      socket.join(roomId);
      socket.to(roomId).emit("user-joined", socket.id);
      console.log(`🚪 User ${socket.id} joined room ${roomId}`);
    } catch (err) {
      console.error("❌ Error joining room:", err);
    }
  });

  socket.on("saveDrawingData", async ({ roomId, drawing }) => {
    try {
      await mongoose.connect(process.env.MONGO_URI);

      const room = await Room.findOne({ roomId });
      if (room) {
        room.drawingData.push(drawing);
        room.lastActivity = new Date();
        await room.save();
        console.log(`🖌️ Drawing data saved for room ${roomId}`);
      }
    } catch (err) {
      console.error("❌ Error saving drawing data:", err);
    }
  });

  socket.on("disconnect", () => {
    console.log("❎ User Disconnected:", socket.id);
  });
};
