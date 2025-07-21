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

    window.addEventListener('mousemove', handleMouseMove);
    setCursors(users.reduce((acc, user) => {
      if (user.id !== socket.id) {
        acc[user.id] = user;
      }
      return acc;
    }, {}));

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [socket, roomId, users]);

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