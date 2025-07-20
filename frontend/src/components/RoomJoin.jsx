import React, { useState } from "react";
import GenerateCode from "../GenerateCode"
const RoomJoin = ({ onJoin, socket }) => {
  const [inputRoomId, setInputRoomId] = useState("");

  const handleJoin = () => {
    if (inputRoomId.trim() !== "") {
      const roomId = inputRoomId.trim();
      socket.emit("join-room", roomId);
      onJoin(roomId);
    }
  };

  const handleCreateRoom = () => {
    const newRoomId = GenerateCode()
    
    socket.emit("join-room", newRoomId);
    onJoin(newRoomId);
  };

  return (
    <div
      className="flex flex-col items-center justify-center h-screen space-y-6"
      style={{
        backgroundColor: "#000000",
        backgroundImage:
          "url('https://www.transparenttextures.com/patterns/old-wall.png')",
      }}
    >
      <h1 className="text-3xl font-bold text-white">🎨 Whiteboard App</h1>

      <div className="flex gap-4">
        <input
          type="text"
          placeholder="Enter Room Code"
          value={inputRoomId}
          onChange={(e) => setInputRoomId(e.target.value)}
          className="p-2 rounded text-black bg-white"
        />
        <button
          onClick={handleJoin}
          className="bg-blue-600 cursor-pointer px-4 py-2 rounded hover:bg-blue-700"
        >
          Join Room
        </button>
      </div>

      <div>
        <button
          onClick={handleCreateRoom}
          className="bg-green-600 cursor-pointer px-6 py-2 rounded hover:bg-green-700"
        >
          + Create New Room
        </button>
      </div>
    </div>
  );
};

export default RoomJoin;
