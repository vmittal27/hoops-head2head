import {Heading, Container, Flex, Button, Text, UnorderedList, ListItem, IconButton} from '@chakra-ui/react'
import {Slider, SliderTrack, SliderFilledTrack, SliderThumb} from '@chakra-ui/react'
import { CopyIcon } from '@chakra-ui/icons'
import Chat from './Chat.jsx'
import DifficultyButton from './Difficulty.jsx'
import '../css/MultiPlayer.css'

function Lobby({
    roomId, leaveRoom, // room information
    userCount, users, currentUser, // users information
    difficulty, setDifficulty, roundTime, setRoundTime, roundNum, setRoundNum, // game settings
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

    return (
        <>
            <Heading fontWeight='bold' size='lg'> Multiplayer </Heading>
            <Container class="selectDif">
                <Container>
                    <Heading fontWeight='bold' size='lg' m='10px'>Current Difficulty: {difficulty[0].toUpperCase() + difficulty.slice(1)} </Heading>
                    {currentUser === users[0] && (
                        <DifficultyButton changeDifficulty={setDifficulty} difficulty={difficulty} roomId = {roomId} />
                    )}
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
                    </Flex>
                    <Button onClick={leaveRoom} position='absolute' top='5%' right='5%'>Leave Room</Button>
                    <Text fontSize='lg' textAlign='left' mx='10px' my='5px'>Players: {userCount}</Text>
                    <UnorderedList styleType="''" textAlign='left' fontSize='lg' mx='10px'>
                        {users.map((user) => {
                            return <ListItem >Guest {user.substring(0,5)}</ListItem>;
                        })}
                    </UnorderedList>
                </Container>    
                <Chat socket = {socket} roomId={roomId} />
            </Container>
            <Button width='100%' colorScheme="green" size='lg' onClick={startGame} isDisabled={userCount < 1 || currentUser != users[0] || lobby != userCount}>
                Start Game
            </Button>
        </>
    )
}

export default Lobby; 
