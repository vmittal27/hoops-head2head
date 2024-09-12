import Chat from "../components/Chat";
import { io } from "socket.io-client";
import { useEffect, useState, useCallback } from "react";
import "../css/Multiplayer.css"
import Loading from '../components/Loading'
import MultiplayerScreen from "../components/MultiplayerPlayScreen";
import MultiplayerEntryPoint from "../components/MultiplayerEntryPoint";
import Lobby from '../components/Lobby.jsx'
import Scoreboard from "../components/Scoreboard";
import {Link, Image, Text, Container, NumberInput, NumberInputField, Button, Box, IconButton, useColorMode} from "@chakra-ui/react";
import DifficultyButton from '../components/Difficulty'
import { Heading, UnorderedList, ListItem, Flex } from "@chakra-ui/react";
import {
	Slider,
	SliderTrack,
	SliderFilledTrack,
	SliderThumb,
} from '@chakra-ui/react'
import { MoonIcon, CopyIcon, SunIcon } from '@chakra-ui/icons'
import { useParams, useNavigate } from 'react-router-dom'
import logoImage from '../components/hoopsh2hlogo1-removebg-preview.png'
import { Form } from "react-router-dom";

import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
	CircularProgress
} from '@chakra-ui/react'
import {
	Stat,
	StatNumber,
} from '@chakra-ui/react'

const socket = io("localhost:5000/", {
	transports: ["websocket"],
	cors: {
		origin: "http://localhost:5173/",
	},
});

function MultiPlayer() {
	const [roomId, setRoomId] = useState('');
	const [joinRoomId, setJoinRoomId] = useState('');
	const [userCount, setUserCount] = useState(0);
	const [users, setUsers] = useState([]);
	const [error, setError] = useState('');
	const [difficulty, setDifficulty] = useState('easy');
	const [roundTime, setRoundTime] = useState(75)
    const [roundNum, setRoundNum] = useState(5);
	const [currentUser, setCurrentUser] = useState(null);
	const [started, setStarted] = useState(false);
	const [timeLeft, setTimeLeft] = useState(75); // Time left for the countdown
    const [isFinished, setIsFinished] = useState(false);
    const [numFinished, setNumFinished] = useState(0);
	const [scoreBoard, setScoreBoard] = useState({})
	const [lobby, setLobby] = useState(0);
    const [score, setScore] = useState(0);
	const [curRound, setCurRound] = useState(1); 
	const [transitionTime, setTransitionTime] = useState(10);
	const [roundData, setRoundData] = useState([]);
    const [username, setUsername] = useState(localStorage.getItem('username') || '');
	const [idToUser, setIdToUser] = useState({});
	const [roundPath, setRoundPath] = useState([]);
	const [roundGuessesUsed, setRoundGuessesUsed] = useState(0); 

	const { colorMode, toggleColorMode } = useColorMode();

	const API_BASE_URL = "http://localhost:5000/"

    const { roomIdUrl } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        if (roomIdUrl) {
			console.log('this use effect was called');
            setRoomId(roomIdUrl);
            joinRoom(roomIdUrl);
        }
    }, [])

	useEffect(() => {
		setCurrentUser(socket.id);
		
		// Store the socket ID in local storage
		localStorage.setItem('socketId', socket.id);

		socket.on('join_success', (data) => {
			setRoomId(data.room_id);
			setUserCount(data.user_count);
			setLobby(data.user_count);
			setError('');
		});
		
		socket.on('user_joined', (data) => {
			setUserCount(data.user_count);
			setLobby(data.user_count);
			console.log("users" + data.users);
			setUsers(data.users);
			setIdToUser(data.user_map);
			console.log("idToUser:", data.user_map);
			const newScoreBoard = Object.fromEntries(
				data.users.map(id => [id, 0])
			);
			setScoreBoard(newScoreBoard); 
		});
		
		socket.on('leave', (data) => {
			setUserCount(data.user_count);
			setLobby(data.user_count);
			setUsers(data.users);
			setIdToUser(data.user_map);
			const newScoreBoard = Object.fromEntries(
				data.users.map(id => [id, 0])
			);
			setScoreBoard(newScoreBoard);
			
		});
		
		socket.on('error', (data) => {
			setError(data.message);
		});
		
		socket.on('settings_changed', (data) => {
			setDifficulty(data.difficulty); 
			setRoundTime(data.roundTime);
            setTimeLeft(data.roundTime);
			setRoundNum(data.roundNum)
			console.log(data.difficulty, data.roundNum);
		});

		socket.on('start_game', (data) => {
			setRoundData(data.players);
			setLobby(0); //nobody in lobby
			setStarted(true); 
			// setRoundPath([data.players[curRound - 1].player_data.currPlayerID])
			console.log("game start test", data.players);
		});

		socket.on('time_changed', (data) => {
			setTimeLeft(data.newTime);
		})

        socket.on('user_finished', (data) => {
            setNumFinished((num) => num + 1);
        })

        socket.on('scores_added', (data) => {
			setScoreBoard(data); 
			console.log(data);
        })

		socket.on('user_score', (data) => {
			setScore(data.score);
		})
		
		
		socket.on('transition_time_changed', (data) => {
			setTransitionTime(data.newTime);
		})

		socket.on('lobby_rejoined', (data) => {
			setLobby((prevLobby) => prevLobby + 1);
		})

		socket.on('start_new_round', (data) => {
			setCurRound((round) => round + 1);
			setIsFinished(false);
			setNumFinished(0);
			setTransitionTime(10); 
			console.log("Set new transition time");
		})

		return () => {
			socket.off('join_success');
			socket.off('user_joined');
			socket.off('leave');
			socket.off('error');
			socket.off('settings_changed');
			socket.off('start_game');
            socket.off('time_changed');
            socket.off('user_finished');
			socket.off('user_score')
			socket.off('scores_added');
			socket.off('transition_time_changed');
			socket.off('lobby_rejoined');
			socket.off('start_new_round');
			localStorage.setItem('oldSocketId', socket.id);
		};
	}, [users]);

	useEffect(() => {
		if (currentUser === users[0]) {
			socket.emit('settings_changed', {'room_id' : roomId, 'difficulty': difficulty, 'roundTime' : roundTime, 'roundNum': roundNum})
			console.log(difficulty, roundTime);
		}
		
	}, [difficulty, roundTime, users, roundNum]);
    
    useEffect(() => {
        console.log('isFinished changed')
        if (isFinished) {
            socket.emit('user_finished', {'id' : currentUser, 'room_id' : roomId});
			window.scrollTo({
				top: 0,
				left: 0,
				behavior: 'smooth'
			});
			socket.emit('submit_score', {'room_id': roomId, 'guessesUsed': roundGuessesUsed, 'user': currentUser, 'path': roundPath})
        }
    }, [isFinished])

	const createRoom = async () => {
		try {
			const response = await fetch(`${API_BASE_URL}/create_room`, { method: 'POST' });
			const data = await response.json();
			console.log("room id" + data.room_id);
			joinRoom(data.room_id);
            localStorage.setItem('roomId', data.room_id);
            navigate(`/multiplayer/${data.room_id}`)
		} catch (err) {
			setError('Failed to create room');
		}
	};

	const joinRoom = (id) => {
		socket.emit('user_joined', { room_id: id, username : username});
		localStorage.setItem('roomId', id);
		// console.log("test" + users);
		console.log('joinRoom was called');
	};

	const leaveRoom = () => {
		socket.emit('leave', { room_id: roomId });
		setRoomId('');
		localStorage.removeItem('roomId');
		setUserCount(0);
	};

	const handleJoinSubmit = (e) => {
		e.preventDefault();
		if (joinRoomId) {
			joinRoom(joinRoomId);
			console.log("test" + joinRoomId);
			setJoinRoomId('');
            navigate(`/multiplayer/${joinRoomId}`)
		}
	};

	const startGame = () => {
		setStarted(true);
		setTimeLeft(roundTime);	
		socket.emit('start_game', { room_id: roomId, rounds : roundNum, difficulty : difficulty});
	};

	const resetGame = () => {
		setStarted(false); 
		setIsFinished(false);
		setCurRound(1);
		setScore(0);
		setTransitionTime(10);
		const newScoreBoard = Object.fromEntries(
			users.map(id => [id, 0])
		);
		setScoreBoard(newScoreBoard);
		socket.emit('lobby_rejoined', {'room_id' : roomId})
		setTimeLeft(roundTime);
		setNumFinished(0); 
	}

	const CountdownTimer = ( { startTime } ) => {

		const [time, setTime] = useState(startTime);
	  
		useEffect(
			() => {
				if (time >= 0) {
					const timerId = setInterval(
						() => {setTime((prevTime) => prevTime - 1);},
						1000
					);
					socket.emit('time_changed', {'room_id' : roomId, 'time' : time});
					return () => clearInterval(timerId); // Cleanup interval on unmount
		  		} 
			}, 
			[time]
		);

		return (
			<div>
            	{
					time <= 0 ? 
					<Text size='lg'>Time's up!</Text> : 
					<Stat><StatNumber>{new Date(timeLeft * 1000).toISOString().substring(14, 19)}</StatNumber></Stat>
				}
		  	</div>
		);
	};

	const TransitionTimer = ( { startTime } ) => {
		const [time, setTime] = useState(startTime);
	  
		useEffect(
			() => {
		  		if (time >= 0) {
					const timerId = setInterval(
						() => {setTime((prevTime) => prevTime - 1);}, 
						1000
					);
					socket.emit('transition_time_changed', {'room_id' : roomId, 'time' : time})
					console.log("Current transition time", time);
					return () => clearInterval(timerId); // Cleanup interval on unmount
		 		} 
				else {
					setTimeLeft(roundTime); 
					if (currentUser === users[0]) {
						socket.emit('start_new_round', {'room_id' : roomId});
					}
					setTransitionTime(10); 
				}
			}, 
			[time]
		);

		return (
			<div>
				{
					time >= 0 ? 
					<Stat><StatNumber>{new Date(time * 1000).toISOString().substring(14, 19)}</StatNumber></Stat> :
					<Heading size='md'>Waiting for next round...</Heading>
				}
		  	</div>
		);
	};


	return (
		<Container className="App-Container">
			<div className='header'>
				<a href="/"><Image src={logoImage} boxSize = '150' objectFit='cover' position='relative'/></a>
				<Text fontWeight='bold' fontSize='3xl'> Hoops Head 2 Head </Text>
				{/* (username != '' && ) */}
				<Text position = 'absolute' right = '100px' fontWeight='bold'> Welcome, {username}! </Text> 
				
				<IconButton onClick={toggleColorMode} icon={colorMode === 'light' ? <MoonIcon/> : <SunIcon/>} position='absolute' right='50px'>
					Toggle {colorMode === 'light' ? 'Dark' : 'Light'}
				</IconButton>
			</div>
			{error && <Text style={{color: 'red'}}>{error}</Text>}
			{!roomId ? 
				(
					<>
						<MultiplayerEntryPoint
							handleClick={createRoom}
							handleSubmit={handleJoinSubmit}
							roomId={joinRoomId}
							setRoomId={setJoinRoomId}
                            username={username}
                            setUsername={setUsername}
						/>
					</>
				) : 
				( 
					!started ? 
					(	<>
							<Lobby
								roomId={roomId}
								leaveRoom={leaveRoom}
								userCount={userCount}
								users={users}
								currentUser={currentUser}
								difficulty={difficulty}
								setDifficulty={setDifficulty}
								roundTime={roundTime}
								setRoundTime={setRoundTime}
								roundNum={roundNum}
								setRoundNum={setRoundNum}
								username={username}
								idToUser={idToUser}
								socket={socket}
								lobby={lobby}
								startGame={startGame}
							/>
						</>
					) :
					(
						(timeLeft > 0 && numFinished < userCount)? (
                        (roundData.length != 0)? (
						<>
							<CountdownTimer startTime={timeLeft} />
							<Text>Round: {curRound}</Text>
							<MultiplayerScreen data_m = {roundData[curRound-1].player_data} pics_m = {roundData[curRound-1].pictures} 
							players_m = {roundData[curRound-1].players} //just need to make this data[curRound-1], etc.
							path_m = {roundData[curRound-1].path} difficulty_m = {difficulty} time_m = {roundTime} setIsFinished={setIsFinished}
                            score = {score} setScore = {setScore} setRoundPath={setRoundPath} setRoundGuessesUsed={setRoundGuessesUsed}/>
							<Modal isOpen={isFinished} closeOnOverlayClick={false} isCentered={true} size='lg'>
								<ModalOverlay />
								<ModalContent>
									<ModalHeader>Waiting for other players . . .</ModalHeader>
									<ModalBody display='flex' flexDirection='row' alignItems='center' gap='1em'>
										<CircularProgress value={(numFinished / userCount) * 100}/>
										<Text fontSize='xl'>Players Finished: {numFinished}</Text>
									</ModalBody>
									<ModalFooter margin='auto'>
										<Stat><StatNumber>{new Date(timeLeft * 1000).toISOString().substring(14, 19)}</StatNumber></Stat>
									</ModalFooter>

								</ModalContent>
							</Modal>
						</>
                        ) : (
                            <>
                            <Loading />
                            </>
                        )
						) : (
							curRound < roundNum ? (
								<>
									<Heading size="lg">Round {curRound} Results</Heading>
									<Heading size="md">{username} </Heading>
									<Heading size="sm">Score: {score} </Heading>
									<TransitionTimer startTime={transitionTime}/>
									<Scoreboard scores = {scoreBoard} idToUser={idToUser}/>
								</>
							) : (
								<>
									<Heading size="lg">Final Results</Heading>
									<Heading size="md"> {username} </Heading>
									<Heading size="sm">Score: {score} </Heading>
									<Scoreboard scores = {scoreBoard} idToUser={idToUser}/>
									<Button onClick={resetGame}>Return to Lobby</Button> 
								</>
							)
						)
					)
				)
			}
			
		</Container>
	);
};

export default MultiPlayer;