import HttpCall from "../components/HttpCall";
import Chat from "../components/Chat";
import { io } from "socket.io-client";
import { useEffect, useState } from "react";
import "../css/Lobby.css"
import Multiplayer from "./Multiplayer";
import {Link, Image, Text, Container, NumberInput, NumberInputField, Button, Box, IconButton, useColorMode} from "@chakra-ui/react";
import DifficultyButton from '../components/Difficulty'
import { Heading, UnorderedList, ListItem, Flex } from "@chakra-ui/react";
import {
	Slider,
	SliderTrack,
	SliderFilledTrack,
	SliderThumb,
	SliderMark,
} from '@chakra-ui/react'
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
	const [roundTime, setRoundTime] = useState(75)
	const { colorMode, toggleColorMode } = useColorMode();
	const [currentPlayer, setCurrentPlayer] = useState(null);
	const [started, setStarted] = useState(false);

	useEffect(() => {
		setCurrentPlayer(socket.id); //current player socket id fweh
		
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
		
		socket.on('change_settings', (data) => {
			setDifficulty(data.difficulty); 
			setRoundTime(data.roundTime);
			console.log(data.difficulty, data.roundTime);
		});

		socket.on('game_started', () => {
			setStarted(true); 
		});
		
		
		return () => {
			socket.off('join_success');
			socket.off('player_joined');
			socket.off('player_left');
			socket.off('error');
			socket.off('change_settings')
			socket.off('game_started')
		};
	}, [players]);

	useEffect(() => {
		socket.emit('settings_changed', {'room_id' : roomId, 'difficulty': difficulty, 'roundTime' : roundTime})
		console.log(difficulty, roundTime);
	}, [difficulty, roundTime]);

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
		setStarted(true);
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
			{!roomId ? 
				(
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
				) : 
				( 
					!started ? 
					(
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
								<Container>
									<Heading fontWeight='bold' size='lg' m='10px'>Current Difficulty: {difficulty[0].toUpperCase() + difficulty.slice(1)} </Heading>
									{currentPlayer === players[0] && (
										<DifficultyButton changeDifficulty={setDifficulty} difficulty={difficulty} roomId = {roomId} />
									)}
								</Container>
								<Container>
									<Heading fontWeight='bold' size='lg' m='10px'>Round Length: {roundTime} seconds</Heading>
									{currentPlayer === players[0] && (
										<Slider min={30} max={120} onChangeEnd={(val) => setRoundTime(val)}>
										<SliderTrack>
										<SliderFilledTrack />
										</SliderTrack>
										<SliderThumb />
										</Slider>
									)}
								</Container>
							</Container>
							<Button top='480px' width='100%' colorScheme="green" size='lg' onClick={startGame} isDisabled={playerCount < 2 || currentPlayer != players[0]}>
								Start Game
							</Button>
						</>
					) :
					(
						<>
							<Multiplayer/>
						</>
					)
				)
			}
		</Container>
	);
};

export default Lobby;