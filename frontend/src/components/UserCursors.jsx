import React, { useEffect, useState } from 'react';

const UserCursors = ({ socket, roomId, users }) => {
  const [cursors, setCursors] = useState({});

  useEffect(() => {
    const handleMouseMove = (e) => {
      socket.emit('cursor-move', { 
        roomId,
        x: e.clientX, 
        y: e.clientY 
      });
    };

    const handleCursorUpdate = (updatedUsers) => {
      setCursors(updatedUsers.reduce((acc, user) => {
        if (user.id !== socket.id) { // Don't show own cursor
          acc[user.id] = user;
        }
        return acc;
      }, {}));
    };

    window.addEventListener('mousemove', handleMouseMove);
    socket.on('user-cursors', handleCursorUpdate);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      socket.off('user-cursors', handleCursorUpdate);
    };
  }, [socket, roomId]);

  return (
    <>
      {Object.values(cursors).map((cursor) => (
        <div
          key={cursor.id}
          className="absolute w-3 h-3 rounded-full transform -translate-x-1/2 -translate-y-1/2"
          style={{ 
            top: cursor.y, 
            left: cursor.x,
            backgroundColor: cursor.color || 'red'
          }}
        />
      ))}
    </>
  );
};

export default UserCursors;