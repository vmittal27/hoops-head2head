import { useEffect, useState, } from "react";
import { useParams, useNavigate } from 'react-router-dom'
import { io } from "socket.io-client";

import "../css/Multiplayer.css"
import logoImage from '../components/hoopsh2hlogo1-removebg-preview.png'

import Loading from '../components/Loading'
import MultiplayerScreen from "../components/MultiplayerPlayScreen";
import MultiplayerEntryPoint from "../components/MultiplayerEntryPoint";
import Lobby from '../components/Lobby.jsx'
import Scoreboard from "../components/Scoreboard";
import Timer from "../components/Timer.jsx"

import { Image, Text, Container, Button, Heading, IconButton, useColorMode, CircularProgress, UnorderedList, ListItem} from "@chakra-ui/react";
import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalFooter, ModalBody, useDisclosure, Flex } from '@chakra-ui/react'
import { MoonIcon, SunIcon, QuestionOutlineIcon } from '@chakra-ui/icons'
import { Tabs, TabList, TabPanels, Tab, TabPanel } from '@chakra-ui/react'

const socket = io("localhost:5000/", {
	transports: ["websocket"],
	cors: {
		origin: "http://localhost:5173/",
	},
});

const API_BASE_URL = "http://localhost:5000/"

function MultiPlayer() {
	const [roomId, setRoomId] = useState('');
	const [joinRoomId, setJoinRoomId] = useState('');
	const [userCount, setUserCount] = useState(0);
	const [users, setUsers] = useState([]);
	const [error, setError] = useState('');
	const [difficulty, setDifficulty] = useState('normal');
    const [roundNum, setRoundNum] = useState(5);
	const [currentUser, setCurrentUser] = useState(null);
	const [started, setStarted] = useState(false);
    const [isFinished, setIsFinished] = useState(false);
    const [numFinished, setNumFinished] = useState(0);
	const [scoreBoard, setScoreBoard] = useState({})
	const [lobby, setLobby] = useState(0);
    const [score, setScore] = useState(0);
	const [curRound, setCurRound] = useState(1); 
	const [roundData, setRoundData] = useState([]);
    const [username, setUsername] = useState(localStorage.getItem('username') || '');
	const [idToUser, setIdToUser] = useState({});
	const [roundPath, setRoundPath] = useState([]);
	const [roundGuessesUsed, setRoundGuessesUsed] = useState(0); 
	const [roundTime, setRoundTime] = useState(75); 
	const [roundEndTime, setRoundEndTime] = useState(null); 
	const [roundTimeFinished, setRoundTimeFinished] = useState(false);
	const [transitionEndTime, setTransitionEndTime] = useState(null); 
	const [transitionTimeFinished, setTransitionTimeFinished] = useState(false);


	const { colorMode, toggleColorMode } = useColorMode();

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
			setDifficulty(data.difficulty);
			setRoundNum(data.roundNum);
			setRoundTime(data.roundTime);
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
			setRoomId('');
		});
		
		socket.on('settings_changed', (data) => {
			setDifficulty(data.difficulty); 
			setRoundNum(data.roundNum)
			setRoundTime(data.roundTime)
			console.log(data.difficulty, data.roundNum);
		});

		socket.on('start_game', (data) => {
			setRoundData(data.players);
			setLobby(0); //nobody in lobby
			setStarted(true); 
			setRoundEndTime(new Date(data.roundEnd*1000)); 
			console.log("game start test", data.players);
		});

		socket.on('show_loading', () => {
			setStarted(true);
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
		
		
		socket.on('lobby_rejoined', (data) => {
			setLobby((prevLobby) => prevLobby + 1);
		})

		socket.on('start_new_round', (data) => {
			setCurRound((round) => round + 1);
			setIsFinished(false);
			setNumFinished(0);
			setTransitionEndTime(null); 
			setRoundPath([]);
			setTransitionTimeFinished(false);
			setRoundEndTime(new Date(data.roundEnd*1000)); 
			setRoundTimeFinished(false); 
			// console.log("Set new transition time");
		})

		socket.on('new_round_at', (data) => {
			setTransitionEndTime(new Date(data.time*1000)); 
			console.log(new Date(data.time*1000));
		})

		return () => {
			socket.off('join_success');
			socket.off('user_joined');
			socket.off('leave');
			socket.off('error');
			socket.off('settings_changed');
			socket.off('start_game');
            socket.off('user_finished');
			socket.off('user_score')
			socket.off('scores_added');
			socket.off('lobby_rejoined');
			socket.off('start_new_round');
			socket.off('new_round_at');
			socket.off('show_loading')
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
		console.log(roundTimeFinished.toString()); 
        if (isFinished || roundTimeFinished) {
			console.log('emitting', roundPath, roundGuessesUsed);
            socket.emit('user_finished', {'id' : currentUser, 'room_id' : roomId});
			window.scrollTo({
				top: 0,
				left: 0,
				behavior: 'smooth'
			});
			socket.emit('submit_score', {'room_id': roomId, 'guessesUsed': roundGuessesUsed, 'user': currentUser, 'path': roundPath})
        }
    }, [isFinished, roundTimeFinished])

	useEffect(() => {
		if (transitionTimeFinished && currentUser === users[0]) {
			socket.emit('start_new_round', {'room_id' : roomId});
		}
	}, [transitionTimeFinished]); 

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
		socket.emit('start_game', { room_id: roomId, rounds : roundNum, difficulty : difficulty});
	};

	const resetGame = () => {
		setStarted(false); 
		setIsFinished(false);
		setCurRound(1);
		setNumFinished(0);
		setScore(0);
		setRoundPath([]);
		setRoundData([]);
		setRoundEndTime(null);
		setRoundTimeFinished(false);
		setRoundGuessesUsed(0);
		setTransitionEndTime(null);
		setTransitionTimeFinished(false);
		const newScoreBoard = Object.fromEntries(
			users.map(id => [id, 0])
		);
		setScoreBoard(newScoreBoard);
		socket.emit('lobby_rejoined', {'room_id' : roomId})
		setNumFinished(0); 
	}
	const { isOpen: isRulesOpen , onOpen: onRulesOpen, onClose: onRulesClose } = useDisclosure()

	return (
        <>
        <Flex minWidth='100%' alignItems='center' justifyContent="space-between" py='10px' px='20px'>
				<Flex alignItems='center' gap={3}>
					<a href="/"><Image src={logoImage} boxSize='80px' objectFit='cover'/></a>
					<Heading fontWeight='bold' fontSize='2xl'>Hoops Head 2 Head</Heading>
				</Flex>
				<Flex alignItems='center' gap={3}>
					<Text fontWeight='bold' fontSize='xl'>{username}</Text>
					<IconButton
						onClick={toggleColorMode}
						icon={colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
					>
						Toggle {colorMode === 'light' ? 'Dark' : 'Light'}
					</IconButton>
					<QuestionOutlineIcon onClick={onRulesOpen} className="rules" boxSize={8} />
				</Flex>
			</Flex>
		<Container className="App-Container" maxW="container.xl">

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
						(!roundTimeFinished && numFinished < userCount)? (
                        (roundData.length != 0)? (
						<>
							<Timer endTime={roundEndTime} setTimerFinished={setRoundTimeFinished}></Timer>
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
										<Timer endTime={roundEndTime} setTimerFinished={setRoundTimeFinished}></Timer>
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
									<Timer endTime={transitionEndTime} setTimerFinished={setTransitionTimeFinished}></Timer>
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
        </>
	);
};

export default MultiPlayer;