import HttpCall from "../components/HttpCall";
import WebSocketCall from "../components/WebSocketCall";
import { io } from "socket.io-client";
import { useEffect, useState } from "react";


const socket = io("localhost:5000/", {
  transports: ["websocket"],
  cors: {
    origin: "http://localhost:5173/",
  },
});

function Lobby() {
  const [roomId, setRoomId] = useState('');
  const [joinRoomId, setJoinRoomId] = useState('');
  const [playerCount, setPlayerCount] = useState(0);
  const [error, setError] = useState('');

  useEffect(() => {
    socket.on('join_success', (data) => {
      setRoomId(data.room_id);
      setPlayerCount(data.player_count);
      setError('');
    });

    socket.on('player_joined', (data) => {
      setPlayerCount(data.player_count);
    });

    socket.on('player_left', (data) => {
      setPlayerCount(data.player_count);
    });

    socket.on('error', (data) => {
      setError(data.message);
    });

    return () => {
      socket.off('join_success');
      socket.off('player_joined');
      socket.off('player_left');
      socket.off('error');
    };
  }, []);

  const createRoom = async () => {
    try {
      const response = await fetch('http://localhost:5000/create_room', { method: 'POST' });
      const data = await response.json();
      console.log("room id" + data.room_id);
      joinRoom(data.room_id);
    } catch (err) {
      setError('Failed to create room');
    }
  };

  const joinRoom = (id) => {
    socket.emit('player_joined', { room_id: id });
  };

  const leaveRoom = () => {
    socket.emit('leave', { room_id: roomId });
    setRoomId('');
    setPlayerCount(0);
  };

  const handleJoinSubmit = (e) => {
    e.preventDefault();
    if (joinRoomId) {
      joinRoom(joinRoomId);
      console.log("test" + joinRoomId);
      setJoinRoomId('');
    }
  };

  return (
    <div>
      <h1>Multiplayer Room Example</h1>
      {error && <p style={{color: 'red'}}>{error}</p>}
      {!roomId ? (
        <>
          <button onClick={createRoom}>Create Room</button>
          <form onSubmit={handleJoinSubmit}>
            <input 
              type="text" 
              placeholder="Enter Room ID" 
              value={joinRoomId}
              onChange={(e) => setJoinRoomId(e.target.value)}
            />
            <button type="submit">Join Room</button>
          </form>
        </>
      ) : (
        <>
          <p>Room ID: {roomId}</p>
          <p>Players: {playerCount}</p>
          <button onClick={leaveRoom}>Leave Room</button>
        </>
      )}
    </div>
  );
}

export default Lobby;