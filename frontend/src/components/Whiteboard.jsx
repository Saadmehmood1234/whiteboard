import React, { useEffect, useState } from "react";
import io from "socket.io-client";
import DrawingCanvas from "./DrawingCanvas";
import Toolbar from "./Toolbar";
import UserCursors from "./UserCursors";

const socket = io("http://localhost:5000");

const Whiteboard = ({ roomId }) => {
  const [users, setUsers] = useState([]);
  const [color, setColor] = useState("black");
  const [width, setWidth] = useState(2);
  const [showRoomInfo, setShowRoomInfo] = useState(true);

  useEffect(() => {
    socket.emit("join-room", roomId);

    socket.on("user-connected", (connectedUsers) => {
      setUsers(connectedUsers);
    });

    socket.on("user-disconnected", (connectedUsers) => {
      setUsers(connectedUsers);
    });

    socket.on("load-drawing-data", (drawingData) => {
    });

    return () => {
      socket.emit("leave-room", roomId);
    };
  }, [roomId]);

  return (
    <div className="relative w-full h-screen bg-gray-100 flex flex-col">
      <header className="bg-gray-800 text-white p-4 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-bold">Collaborative Whiteboard</h1>
          <div className={`room-info transition-all duration-300 ${showRoomInfo ? 'opacity-100' : 'opacity-0'}`}>
            <span className="bg-gray-700 px-3 py-1 rounded-md">
              Room: <span className="font-mono">{roomId}</span>
            </span>
            <span className="ml-4 bg-blue-600 px-3 py-1 rounded-md">
              Users: {users.length}
            </span>
          </div>
        </div>
        <button 
          onClick={() => setShowRoomInfo(!showRoomInfo)}
          className="p-2 rounded-full hover:bg-gray-700 transition-colors"
          title={showRoomInfo ? "Hide room info" : "Show room info"}
        >
          {showRoomInfo ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
          )}
        </button>
      </header>
      <div className="flex flex-1 overflow-hidden">
        <div className="w-16 bg-gray-200 border-r border-gray-300 flex flex-col items-center py-4 space-y-4">
          <Toolbar 
            socket={socket} 
            color={color} 
            setColor={setColor}
            width={width}
            setWidth={setWidth}
            roomId={roomId}
          />
        </div>
        <div className="flex-1 relative bg-white">
          <DrawingCanvas 
            socket={socket} 
            roomId={roomId}
            color={color}
            width={width}
          />
          <UserCursors 
            socket={socket} 
            roomId={roomId}
            users={users}
          />
        </div>
      </div>
      <footer className="bg-gray-800 text-white p-2 text-sm flex justify-between items-center">
        <div>
          <span className="text-gray-400">Color: </span>
          <span className="font-medium" style={{ color }}>{color}</span>
          <span className="mx-4 text-gray-400">|</span>
          <span className="text-gray-400">Brush Size: </span>
          <span className="font-medium">{width}px</span>
        </div>
        <div>
          <span className="text-gray-400">Connected: </span>
          {users.map((user, index) => (
            <span 
              key={user.id} 
              className="inline-block w-3 h-3 rounded-full mx-1"
              style={{ backgroundColor: user.color }}
              title={`User ${index + 1}`}
            />
          ))}
        </div>
      </footer>
    </div>
  );
};

export default Whiteboard;