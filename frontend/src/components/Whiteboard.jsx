import React, { useEffect, useState } from "react";
import io from "socket.io-client";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import DrawingCanvas from "./DrawingCanvas";
import Toolbar from "./Toolbar";
import UserCursors from "./UserCursors";
import socket from "../socket";
import { FiCopy } from "react-icons/fi";
import { TiTick } from "react-icons/ti";
const Whiteboard = ({ roomId }) => {
  const [users, setUsers] = useState([]);
  const [color, setColor] = useState("black");
  const [width, setWidth] = useState(2);
  let [isCopy, setISCopy] = useState(false);
  useEffect(() => {
    socket.emit("join-room", roomId);

    socket.on("user-connected", (connectedUsers) => {
      setUsers(connectedUsers);
    });

    socket.on("user-disconnected", (connectedUsers) => {
      setUsers(connectedUsers);
    });

    socket.on("load-drawing-data", (drawingData) => {});

    return () => {
      socket.emit("leave-room", roomId);
    };
  }, [roomId]);
  const copyRoomId = async () => {
    try {
      await navigator.clipboard.writeText(roomId);
      setISCopy(true);
      setTimeout(() => {
        setISCopy(false);
      }, 2000);
    } catch (err) {
      alert("Failed to copy!");
    }
  };
  return (
    <div className="relative w-full h-screen bg-gray-100 flex flex-col">
      <header className="bg-gray-800 text-white p-4 flex justify-between items-center">
        <div className="flex gap-4 max-md:flex-col items-center space-x-4">
          <div className="flex gap-2 justify-center items-center">
            <h1 className="text-xl max-sm:text-md font-bold">
              Collaborative Whiteboard
            </h1>
            <span className="ml-4 max-sm:text-sm w-32 text-center bg-blue-600 px-3 py-1 rounded-md">
              Users: {users.length}
            </span>
          </div>
          <div className="room-info transition-all flex justify-start w-full duration-300 items-center gap-2">
            <span className="bg-gray-700 px-3 py-1 max-sm:text-sm rounded-md select-text">
              Room: <span className="font-mono text-blue-300">{roomId}</span>
            </span>
            <button
              onClick={copyRoomId}
              className="text-white hover:text-green-400"
            >
              {isCopy ? (
                <TiTick size={18} className="cursor-pointer" />
              ) : (
                <FiCopy size={18} className="cursor-pointer" />
              )}
            </button>
          </div>
        </div>
      </header>
      <div className="flex flex-1 flex-col overflow-hidden">
        <div className=" bg-gray-200 border-r border-gray-300 flex flex-col items-center ">
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
          <UserCursors socket={socket} roomId={roomId} users={users} />
        </div>
      </div>
      <footer className="bg-gray-800 text-white p-2 text-sm flex justify-between items-center">
        <div>
          <span className="text-gray-400">Color: </span>
          <span className="font-medium" style={{ color }}>
            {color}
          </span>
          <span className="mx-4 text-gray-400">|</span>
          <span className="text-gray-400">Brush Size: </span>
          <span className="font-medium">{width}px</span>
        </div>
        <div>
          <span className="text-white">Connected: </span>
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
