import {Heading, Container, Flex, Button, Text, UnorderedList, ListItem, IconButton} from '@chakra-ui/react'
import {Slider, SliderTrack, SliderFilledTrack, SliderThumb} from '@chakra-ui/react'
import { CopyIcon } from '@chakra-ui/icons'
import { Icon } from '@chakra-ui/react'
import { FaCrown } from "react-icons/fa";
import Chat from './Chat.jsx'
import DifficultyButton from './Difficulty.jsx'
import '../css/Multiplayer.css'

function Lobby({
    roomId, leaveRoom, // room information
    userCount, users, currentUser, idToUser, // users information
    difficulty, setDifficulty, blind, setBlind, roundTime, setRoundTime, roundNum, setRoundNum, // game settings
    socket, lobby, startGame
}) {

    const copyRoom = async () => {
		try {
			await navigator.clipboard.writeText(roomId);
			console.log('Copied to clipboard:', roomId);
		} catch (error) {
			console.error('Unable to copy to clipboard:', error);
		}
	};
    console.log(idToUser);

    return (
        <>
            <Heading fontWeight='bold' size='lg'> Multiplayer </Heading>
            <Container class="selectDif">
                <Container>
                <Flex direction="column" align="center" justify="center" m="10px">
                    <Heading fontWeight='bold' size='md' m='10px'>Current Difficulty: {difficulty[0].toUpperCase() + difficulty.slice(1)} </Heading>
                    {currentUser === users[0] && (
                        <DifficultyButton changeDifficulty={setDifficulty} difficulty={difficulty}
                        blind={blind} setBlind={setBlind} roomId = {roomId} />
                    )}
                </Flex>
                </Container>
                <Container>
                    <Heading fontWeight='bold' size='md' m='10px'>Round Length: {roundTime} seconds</Heading>
                    {currentUser === users[0] && (
                        <Slider defaultValue={roundTime} min={30} max={120} step={5} onChangeEnd={(val) => setRoundTime(val)}>
                            <SliderTrack>
                                <SliderFilledTrack bg='#c76f0a'/>
                            </SliderTrack>
                            <SliderThumb />
                        </Slider>
                    )}
                    <Heading fontWeight='bold' size='md' m='10px'>Number of Rounds: {roundNum}</Heading>
                    {currentUser === users[0] && (
                        <Slider defaultValue={roundNum} min={1} max={10} step={1} onChangeEnd={(val) => setRoundNum(val)}>
                            <SliderTrack>
                                <SliderFilledTrack bg='#c76f0a'/>
                            </SliderTrack>
                            <SliderThumb />
                        </Slider>
                    )}
                </Container>
            </Container>
            <Container class='bottomcontain'>
                <Container class="lobbycontain">
                    <Heading size='lg' m='10px'>Lobby Info</Heading>
                    <Flex>
                        <Text as='b' fontSize='lg' m='10px'>Room ID: {roomId}</Text>
                        <IconButton icon={<CopyIcon />} onClick={copyRoom}></IconButton>
                        <Button onClick={leaveRoom} marginRight='0' right='2rem' marginLeft='auto' position='relative'>Leave Room</Button>
                    </Flex>
                    <Flex direction="row">
                    <Text fontSize='lg' textAlign='left' mx='10px' my='5px'>Players: {userCount}</Text>
                    {userCount - lobby === 1 ? (
                        <Text fontSize='lg' textAlign='left' my='5px' display="inline"> (Waiting for 1 player)</Text>
                    ) : userCount - lobby > 1 ? (
                        <Text fontSize='lg' textAlign='left' my='5px' display="inline">(Waiting for {userCount - lobby} players)</Text>
                    ) : null}
                    </Flex>
                    <UnorderedList styleType="''" textAlign='left' fontSize='lg' mx='10px'>
                        {users.map((user,index) => {
                            return <ListItem key={user}>
                                    <Text>{idToUser[user]} {' '}
                                    {index === 0 && (<Icon as={FaCrown} color='gold'/>)}</Text>
                                </ListItem>
                        })}
                    </UnorderedList>
                </Container>    
                <Chat idToUser={idToUser} socket = {socket} roomId={roomId} />
            </Container>
            <Button width='100%' colorScheme="green" size='lg' onClick={startGame} isDisabled={userCount < 1 || currentUser != users[0] || lobby != userCount}>
                Start Game
            </Button>
        </>
    )
}

export default Lobby; 
