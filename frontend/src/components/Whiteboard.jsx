import React, { useEffect, useState, useRef } from "react";
import DrawingCanvas from "./DrawingCanvas";
import Toolbar from "./Toolbar";
import UserCursors from "./UserCursors";
import socket from "../socket";
import { FiCopy } from "react-icons/fi";
import { TiTick } from "react-icons/ti";
import ChatRoom from "./ChatRoom"

const Whiteboard = ({ roomId }) => {
  const [users, setUsers] = useState([]);
  const [color, setColor] = useState("black");
  const [width, setWidth] = useState(2);
  const [isCopy, setIsCopy] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [username, setUsername] = useState("");
  const canvasRef = useRef();
  const hasJoined = useRef(false); 
  useEffect(() => {
    const savedUsername =
      localStorage.getItem("whiteboard-username") ||
      prompt("Enter your name") ||
      `User-${Math.floor(Math.random() * 1000)}`;
    localStorage.setItem("whiteboard-username", savedUsername);
    setUsername(savedUsername);
    if (!hasJoined.current) {
      socket.emit("join-room", roomId, savedUsername);
      hasJoined.current = true;
    }

    const handleUserConnected = (connectedUsers) => {
      console.log("Users connected:", connectedUsers);
      setUsers(connectedUsers);
    };

    const handleNewUser = (user) => {
      console.log("New user connected:", user);
      setUsers(prev => [...prev.filter(u => u.id !== user.id), user]);
    };

    const handleUserDisconnected = (connectedUsers) => {
      console.log("Users after disconnect:", connectedUsers);
      setUsers(connectedUsers);
    };

    const handleLoadDrawingData = (drawingData) => {
      if (canvasRef.current) {
        drawingData.forEach(({ x0, y0, x1, y1, color, width }) => {
          canvasRef.current.drawLine(x0, y0, x1, y1, color, width);
        });
      }
    };

    const handleClearCanvas = () => {
      if (canvasRef.current) {
        canvasRef.current.clearCanvas();
      }
    };
    socket.on("user-connected", handleUserConnected);
    socket.on("new-user-connected", handleNewUser);
    socket.on("user-disconnected", handleUserDisconnected);
    socket.on("load-drawing-data", handleLoadDrawingData);
    socket.on("clear-canvas", handleClearCanvas);

    return () => {
      socket.off("user-connected", handleUserConnected);
      socket.off("new-user-connected", handleNewUser);
      socket.off("user-disconnected", handleUserDisconnected);
      socket.off("load-drawing-data", handleLoadDrawingData);
      socket.off("clear-canvas", handleClearCanvas);
      hasJoined.current = false;
    };
  }, [roomId]);

  const copyRoomId = async () => {
    try {
      await navigator.clipboard.writeText(roomId);
      setIsCopy(true);
      setTimeout(() => setIsCopy(false), 2000);
    } catch (err) {
      alert("Failed to copy!");
    }
  };

  const handleClearCanvas = () => {
    if (canvasRef.current) {
      canvasRef.current.clearCanvas();
    }
  };

  return (
    <div className="flex gap-2">
      {isVisible && (
        <ChatRoom
          setIsVisible={setIsVisible}
          roomId={roomId}
          isMobile={false}
        />
      )}
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
              {!isVisible && (
                <button
                  onClick={() => setIsVisible(true)}
                  className="w-20 rounded-full cursor-pointer px-4 h-7 bg-green-500 hover:bg-green-700"
                >
                  Chat
                </button>
              )}
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
              onClearCanvas={handleClearCanvas}
            />
          </div>
          <div className="flex-1 relative bg-white">
            <DrawingCanvas
              ref={canvasRef}
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
    </div>
  );
};

export default Whiteboard;
