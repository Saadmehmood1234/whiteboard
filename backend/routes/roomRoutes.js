const express = require("express");
const router = express.Router();
const Room = require('../model/Room.js');

router.post("/join", async (req, res) => {
  const { roomId } = req.body;
  mongoose.connect(process.env.MONGO_URI);
  let room = await Room.findOne({ roomId });
  if (!room) {
    room = new Room({
      roomId,
      createdAt: new Date(),
      lastActivity: new Date(),
      drawingData: [],
    });
    await room.save();
  }
  res.json(room);
});

router.get("/:roomId", async (req, res) => {
  const room = await Room.findOne({ roomId: req.params.roomId });
  if (room) {
    res.json(room);
  } else {
    res.status(404).json({ message: "Room not found" });
  }
});

module.exports = router;
