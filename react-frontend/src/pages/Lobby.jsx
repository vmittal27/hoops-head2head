import HttpCall from "../components/HttpCall";
import Chat from "../components/Chat";
import { io } from "socket.io-client";
import { useEffect, useState } from "react";
import "../css/Lobby.css"
import {Link, Image, Text, Container, NumberInput, NumberInputField, Button, Box, IconButton, useColorMode} from "@chakra-ui/react";
import DifficultyButton from '../components/Difficulty'
import { Heading, UnorderedList, ListItem, Flex } from "@chakra-ui/react";
import { MoonIcon, CopyIcon } from '@chakra-ui/icons'

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
  const [players, setPlayers] = useState([]);
  const [error, setError] = useState('');
  const [difficulty, setDifficulty] = useState('easy');
  const { colorMode, toggleColorMode } = useColorMode();

  useEffect(() => {
    socket.on('join_success', (data) => {
      setRoomId(data.room_id);
      setPlayerCount(data.player_count);
      setError('');
    });

    socket.on('player_joined', (data) => {
      setPlayerCount(data.player_count);
      console.log("players" + data.players);
      setPlayers(data.players);
      // console.log("players:" + [...players, data.player]);
      // console.log("test" + data.player);  
    });

    socket.on('player_left', (data) => {
      setPlayerCount(data.player_count);
      setPlayers(data.players);
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
  }, [players]);

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
    console.log("test" + players);
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

  const startGame = () => {
    socket.emit('start_game', { room_id: roomId });
  };

  const copyRoom = async () => {
    try {
      await navigator.clipboard.writeText(roomId);
      console.log('Copied to clipboard:', roomId);
    } catch (error) {
      console.error('Unable to copy to clipboard:', error);
    }
  };


  return (
    <Container className="App-Container">
      <div class='header'>
        <Link to='..'>
          <Image src={logoImage} boxSize = '150' objectFit='cover' position='relative'/>
        </Link>
        <Text fontWeight='bold' fontSize='3xl'> Hoops Head 2 Head </Text>
        <IconButton onClick={toggleColorMode} icon={<MoonIcon/>} position='absolute' right='50px'>
            Toggle {colorMode === 'light' ? 'Dark' : 'Light'}
        </IconButton>
      </div>
      <Heading fontWeight='bold' size='lg'> Multiplayer </Heading>
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
          <Container class="lobbycontain">
            <Heading size='lg' m='10px'>Lobby Info</Heading>
            <Flex>
                <Text as='b' fontSize='lg' m='10px'>Room ID: {roomId}</Text>
                <IconButton icon={<CopyIcon />} onClick={copyRoom}></IconButton>
            </Flex>
            <Button onClick={leaveRoom} position='absolute' top='5%' right='5%'>Leave Room</Button>
            <Text fontSize='lg' textAlign='left' mx='10px' my='5px'>Players: {playerCount}</Text>
            <UnorderedList styleType="''" textAlign='left' fontSize='lg' mx='10px'>
                {players.map((player) => {
                return <ListItem >Guest {player.substring(0,5)}</ListItem>;
                })}
            </UnorderedList>
          </Container>    
          <Chat socket = {socket} />
          <Container class="selectDif">
            <Heading fontWeight='bold' size='lg' m='10px'>{difficulty[0].toUpperCase() + difficulty.slice(1)} </Heading>
            <DifficultyButton changeDifficulty={setDifficulty} difficulty={difficulty} />
          </Container>
          <Button top='480px' width='100%' colorScheme="green" size='lg' onClick={startGame} isDisabled={playerCount < 2}>
            Start Game
          </Button>
        </>
      )}
    </Container>
  );
}

export default Lobby;
