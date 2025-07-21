import React, { useEffect, useState, useRef } from "react";
import socket from "../socket";
import { MdClose } from "react-icons/md";

const ChatRoom = ({ setIsVisible, roomId, isMobile }) => {
   const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);
  const messagesEndRef = useRef(null);

   useEffect(() => {
    const handleChatMessage = (msg) => {
      setChat(prev => [...prev, msg]);
    };

    const handleLoadMessages = (messages) => {
      setChat(messages);
    };

    socket.on("chat-message", handleChatMessage);
    socket.on("load-chat-messages", handleLoadMessages);
    socket.emit("request-chat-history", roomId);

    return () => {
      socket.off("chat-message", handleChatMessage);
      socket.off("load-chat-messages", handleLoadMessages);
    };
  }, [roomId]);
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat]);

  const sendMessage = (e) => {
    e?.preventDefault();
    if (message.trim()) {
      socket.emit("chat-message", { roomId, message });
      setMessage("");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      sendMessage();
    }
  };

  const formatTime = (date) => {
    const d = new Date(date);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div
      className={`fixed z-50 flex flex-col ${
        isMobile
          ? "bottom-0 left-0 right-0 h-2/3 rounded-t-2xl"
          : "top-4 right-4 bottom-4 w-80 lg:w-96 rounded-2xl"
      }`}
      style={{
        backgroundColor: "#000000",
        backgroundImage:
          "url('https://www.transparenttextures.com/patterns/fabric-of-squares.png')",
        boxShadow: "0 0 20px rgba(0,0,0,0.3)",
      }}
    >
      <div
        className="flex items-center justify-between text-white p-4"
        style={{
          backgroundColor: "#02635b",
          backgroundImage:
            "url('https://www.transparenttextures.com/patterns/noisy.png')",
        }}
      >
        <h1 className="text-xl font-semibold">Chat Room</h1>
        <MdClose
          onClick={() => setIsVisible(false)}
          size={24}
          className="hover:text-red-400 cursor-pointer"
          aria-label="Close chat"
        />
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {chat.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-100">
            No messages yet. Start the conversation!
          </div>
        ) : (
          chat.map((msg, index) => (
            <div
              key={index}
              className={`p-3 rounded-lg max-w-xs md:max-w-md ${
                msg.senderId === socket.id
                  ? "ml-auto bg-[#02635b] text-white"
                  : msg.isSystem
                  ? "mx-auto bg-gray-700 text-gray-300 text-center text-sm"
                  : "mr-auto bg-gray-200 text-gray-800"
              }`}
            >
              {!msg.isSystem && (
                <div
                  className="font-bold mb-1"
                  style={{ color: msg.senderColor }}
                >
                  {msg.sender}
                </div>
              )}
              <div>{msg.message}</div>
              {!msg.isSystem && (
                <div className="text-xs opacity-70 mt-1 text-right">
                  {formatTime(msg.timestamp)}
                </div>
              )}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <form
        onSubmit={sendMessage}
        className="p-3 border-t border-gray-700"
        style={{
          backgroundColor: "#02635b",
          backgroundImage:
            "url('https://www.transparenttextures.com/patterns/noisy.png')",
        }}
      >
        <div className="flex gap-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            className="flex-1 p-2 sm:p-3 rounded-full border bg-white border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            aria-label="Type your message"
          />
          <button
            type="submit"
            disabled={!message.trim()}
            className="bg-gray-600 hover:bg-gray-700 text-white rounded-full px-3 sm:px-4 py-1 sm:py-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            aria-label="Send message"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatRoom;
