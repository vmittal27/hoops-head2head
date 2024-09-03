import Chat from "../components/Chat";
import { io } from "socket.io-client";
import { useEffect, useState } from "react";
import "../css/Lobby.css"
import Multiplayer from "./Multiplayer";
import Scoreboard from "./Scoreboard";
import {Link, Image, Text, Container, NumberInput, NumberInputField, Button, Box, IconButton, useColorMode} from "@chakra-ui/react";
import DifficultyButton from '../components/Difficulty'
import Waiting from '../components/Waiting'
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
import { Form, json } from "react-router-dom";

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
	const [timeLeft, setTimeLeft] = useState(75); // Time left for the countdown
	const [data, setData] = useState([{currPlayer: "", lastPlayer: "", currPlayerID: "", lastPlayerID: ""}])
    const [isFinished, setIsFinished] = useState(false);
    const [numFinished, setNumFinished] = useState(0);
	const [scoreBoard, setScoreBoard] = useState({})
    // const [roundFinished, setRoundFinished] = useState(false);
    const [score, setScore] = useState(0);
	const [pics, setPics] = useState([{currPlayerURL: "", lastPlayerURL: ""}])

	const [bballPlayers, setBBallPlayers] = useState([])


	const [optimalPath, setOptimalPath] = useState([]);
	const API_BASE_URL = "http://localhost:5000/"

	// const [jsonData, setJsonData] = useState({'room_id': '', 
	// 	'player_data': [{'currPlayer': '', 'lastPlayer': '', 'currPlayerID': '', 'lastPlayerID': ''}], 
	// 	'pictures': [{'currPlayerURL': '', 'lastPlayerURL': ''}], 
	// 	'players': [], 
	// 	'path': []})
	
	useEffect(() => {
		// Using fetch to fetch the api from flask server it will be redirected to proxy
        if (started) {
		console.log('test');
		if(currentPlayer === players[0] && started === true){
			fetch(API_BASE_URL + "players/" + difficulty)
			
			.then(
				(res) => {

					if (!res.ok)
						throw new Error(`HTTP error! status: ${res.status}`);

					console.log("Raw response:", res);
					return res.json();
				}
			)
	
			.then(
				(data) => {
					setData({currPlayer: data["Player 1"]["name"], lastPlayer: data["Player 2"]["name"],
						currPlayerID : data["Player 1"]["id"], lastPlayerID: data["Player 2"]["id"]
					});
					setPics({currPlayerURL: data["Player 1"]["picture_url"], lastPlayerURL: data["Player 2"]["picture_url"]})
				
					setOptimalPath(data['Path']);

					//adding initial player to player list
					console.log('adding first player');
					setBBallPlayers([data["Player 1"]["name"]]);
					console.log(bballPlayers);
					console.log(data);

					const jsonData = {'room_id': roomId,
						'player_data': {currPlayer: data["Player 1"]["name"], lastPlayer: data["Player 2"]["name"],
							currPlayerID : data["Player 1"]["id"], lastPlayerID: data["Player 2"]["id"]
						},
						'pictures': {currPlayerURL: data["Player 1"]["picture_url"], lastPlayerURL: data["Player 2"]["picture_url"]},
						'players': [data["Player 1"]["name"]],
						'path': data['Path']}
				
					console.log("first then", jsonData);
					socket.emit('data_load', jsonData);

				}
			)

			.catch((error) => {console.error("Error fetching data:", error);});
		}
		console.log(data);
        } else {
            socket.emit('round_ended')
        }

	}, [started]);

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
			const newScoreBoard = Object.fromEntries(
				data.players.map(id => [id, 0])
			  );
			setScoreBoard(newScoreBoard);
			// console.log("players:" + [...players, data.player]);
			// console.log("test" + data.player);  
		});
		
		socket.on('player_left', (data) => {
			setPlayerCount(data.player_count);
			setPlayers(data.players);
			const newScoreBoard = Object.fromEntries(
				data.players.map(id => [id, 0])
			  );
			setScoreBoard(newScoreBoard);
			
		});
		
		socket.on('error', (data) => {
			setError(data.message);
		});
		
		socket.on('change_settings', (data) => {
			setDifficulty(data.difficulty); 
			setRoundTime(data.roundTime);
            setTimeLeft(data.roundTime);
			console.log(data.difficulty, data.roundTime);
		});

		socket.on('game_started', () => {
			setStarted(true); 
		});

		socket.on('load_data', (data) => {
			setData(data.data);
			setPics(data.pictures);
			setBBallPlayers(data.players);
			setOptimalPath(data.path);
		})

		socket.on('change_time', (data) => {
			setTimeLeft(data.newTime);
		})

        socket.on('player_finished_endpoint', (data) => {
            setNumFinished((num) => num + 1);
        })

        socket.on('score_added', (data) => {
            setScoreBoard(prevScoreBoard => ({
				...prevScoreBoard, 
				[data.player_id]: (prevScoreBoard[data.player_id] || 0) + data.score
			}));
			console.log(data.score);
            console.log(scoreBoard);
        })

		
		
		return () => {
			socket.off('join_success');
			socket.off('player_joined');
			socket.off('player_left');
			socket.off('error');
			socket.off('change_settings');
			socket.off('game_started');
			socket.off('load_data')
            socket.off('change_time')
            socket.off('player_finished_endpoint')
			socket.off('score_added')
		};
	}, [players]);
	useEffect(() => {
		if(currentPlayer === players[0]){
			socket.emit('settings_changed', {'room_id' : roomId, 'difficulty': difficulty, 'roundTime' : roundTime})
			console.log(difficulty, roundTime);
		}
		
	}, [difficulty, roundTime, players]);
    
    useEffect(() => {
        console.log('isFinished changed')
        if (isFinished) {
            socket.emit('player_finished', {'id' : currentPlayer, 'room_id' : roomId});
        }
    }, [isFinished])


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
		console.log('tester')
		setStarted(true);
		setTimeLeft(roundTime);
	};
	const CountdownTimer = ( { startTime } ) => {
		const [time, setTime] = useState(startTime);
	  
		useEffect(() => {
		  if (time >= 0) {
			const timerId = setInterval(() => {
			  setTime((prevTime) => prevTime - 1);
			}, 1000);
			socket.emit('time_change', {'room_id' : roomId, 'time' : time})
			return () => clearInterval(timerId); // Cleanup interval on unmount
		  } 
		}, [time]);

		return (
		  <div>
            {time <= 0 ? <Text size='md'>Time's up!</Text> : <Text size='md'>Time left: {time}</Text>}
		  </div>
		);
	  };

	const copyRoom = async () => {
		try {
			await navigator.clipboard.writeText(roomId);
			console.log('Copied to clipboard:', roomId);
		} catch (error) {
			console.error('Unable to copy to clipboard:', error);
		}
	};

    useEffect (() => {
        if (isFinished) {
            socket.emit('sending_score', {'score' : score, 'player_id' : currentPlayer, 'room_id' : roomId})
        }
		console.log('eat my ass');
    }, [isFinished])


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
			{error && <Text style={{color: 'red'}}>{error}</Text>}
			{!roomId ? 
				(
					<>
                        <Heading fontWeight='bold' size='lg'> Multiplayer </Heading>
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
                            <Heading fontWeight='bold' size='lg'> Multiplayer </Heading>
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
										<Slider min={30} max={120} step={5} onChangeEnd={(val) => setRoundTime(val)}>
										    <SliderTrack>
										        <SliderFilledTrack bg='#c76f0a'/>
										    </SliderTrack>
										    <SliderThumb />
										</Slider>
									)}
								</Container>
							</Container>
							<Button top='480px' width='100%' colorScheme="green" size='lg' onClick={startGame} isDisabled={playerCount < 1 || currentPlayer != players[0]}>
								Start Game
							</Button>
						</>
					) :
					(
						(timeLeft > 0 && numFinished < playerCount)? (
                        isFinished ? ( 
                        <>
							<Heading>Guest {socket.id.substring(0,5)} </Heading>
							<Heading>Previous Round Score: {score} </Heading>
                            <CountdownTimer startTime={timeLeft} />
                            <Waiting numFinished = {numFinished} totalNumber = {playerCount} />
                        </>
                        ) : (
                        <>
							<CountdownTimer startTime={timeLeft} />
							<Multiplayer data_m = {data} pics_m = {pics} players_m = {bballPlayers}
							path_m = {optimalPath} difficulty_m = {difficulty} time_m = {roundTime} setIsFinished={setIsFinished}
                            score = {score} setScore = {setScore}  />
						</>
                        )
						) : (
							<>
                            <Heading size="lg">Round Over!</Heading>
							<Heading size="md">Guest {socket.id.substring(0,5)} </Heading>
							<Heading size="sm">Round Score: {score} </Heading>
                            <Scoreboard scores = {scoreBoard}/>
							</>
						)
					)
				)
			}
		</Container>
	);
};

export default Lobby;