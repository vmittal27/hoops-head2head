import HttpCall from "../components/HttpCall";
import WebSocketCall from "../components/WebSocketCall";
import { io } from "socket.io-client";
import { useEffect, useState } from "react";
import "../css/Lobby.css"
import {Link, Image, Text, Container, NumberInput, NumberInputField, Button, Box} from "@chakra-ui/react";

import logoImage from '../components/hoopsh2hlogo1-removebg-preview.png'
import { Form } from "react-router-dom";

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
    <Container className="App-Container">
      <div class='header'>
        <Link to='..'>
          <Image src={logoImage} boxSize = '150' objectFit='cover' position='relative'/>
        </Link>
        <Text fontWeight='bold' fontSize='3xl'> Hoops Head 2 Head </Text>
      </div>
      <Text fontWeight='bold' fontSize='xl'> Multiplayer Mode </Text>
      {error && <Text style={{color: 'red'}}>{error}</Text>}
      {!roomId ? (
        <>
          <Box className="Menu-Box">
            <Button className="Menu-Element" colorScheme="teal" size='lg' onClick={createRoom}>Create a Room</Button>
            <Form className='Form' onSubmit={handleJoinSubmit}>
              <Text fontSize='xl'>Join a Room</Text>
              <NumberInput className='Menu-Element' colorScheme="teal" size='lg' min={100001} max={999999}>
                <NumberInputField colorScheme='teal' placeholder="Room ID" value={joinRoomId} onChange={(e) => setJoinRoomId(e.target.value)}/>
              </NumberInput>
              <Button className="Menu-Element" colorScheme="teal" size='lg' type="submit" isDisabled={!joinRoomId}>Join Room</Button>
            </Form>
          </Box>
        </>
      ) : (
        <>
          <p>Room ID: {roomId}</p>
          <p>Players: {playerCount}</p>
          <button onClick={leaveRoom}>Leave Room</button>
        </>
      )}
    </Container>
  );
}

export default Lobby;