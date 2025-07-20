import React, { useEffect, useState } from 'react';
import socket from '../socket';

const ChatRoom = () => {
  const [message, setMessage] = useState('');
  const [chat, setChat] = useState<string[]>([]);

  useEffect(() => {
    socket.on('chat-message', (msg) => {
      setChat((prev) => [...prev, msg]);
    });

    return () => {
      socket.off('chat-message');
    };
  }, []);

  const sendMessage = () => {
    if (message.trim()) {
      socket.emit('chat-message', message);
      setChat((prev) => [...prev, `You: ${message}`]);
      setMessage('');
    }
  };

  return (
    <div className="p-4 z-10 max-w-md mx-auto text-white">
      <h2 className="text-xl font-bold mb-4">Chat Room</h2>
      <div className="bg-gray-200 p-3 rounded h-64 overflow-y-auto mb-4">
        {chat.map((msg, idx) => (
          <p key={idx}>{msg}</p>
        ))}
      </div>
      <div className="flex bg-yellow-200">
        <input
          type="text"
         
          className="flex-1 bg-gray-300 border-2 border-red-400 outline-1 p-2 text-black"
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
        />
        <button
          className="ml-2 bg-blue-600 px-4 py-2 rounded"
          onClick={sendMessage}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatRoom;
