import React, { useState } from "react";
import RoomJoin from "./components/RoomJoin";
import Whiteboard from "./components/Whiteboard";
import socket from './socket';

const App = () => {
  const [roomId, setRoomId] = useState(null);
console.log(socket)
  return (
    <>
      {!roomId ? (
        <RoomJoin socket={socket} onJoin={setRoomId} />
      ) : (
        <Whiteboard socket={socket} roomId={roomId} />
      )}
    </>
  );
};

export default App;
