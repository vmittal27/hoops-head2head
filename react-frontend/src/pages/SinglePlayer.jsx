import React, { useState, useEffect } from 'react'
import { gsap } from 'gsap'
import '../components/Difficulty'

import '../css/SinglePlayer.css'
import GuessForm from '../components/GuessForm'
import { MoonIcon, SunIcon, QuestionOutlineIcon } from '@chakra-ui/icons'
import { VStack,Container, Heading, Text } from '@chakra-ui/react'
import { IconButton, useColorMode } from "@chakra-ui/react";
import {
	Modal,
	ModalOverlay,
	ModalContent,
	ModalHeader,
	ModalFooter,
	ModalBody,
	useDisclosure,
	Button,
	Image,
    Box, 
	Flex
} from '@chakra-ui/react'

import myImage from '../components/wedidit.jpeg'
import loseImage from '../components/embiid.jpeg'
import logoImage from '../components/hoopsh2hlogo1-removebg-preview.png'
import defaultImage from '../components/default-pic.png'
import DifficultyButton from '../components/Difficulty'
import RulesModal from '../components/RulesModal'

function SinglePlayer() {
	const [data, setData] = useState([{currPlayer: "", lastPlayer: "", currPlayerID: "", lastPlayerID: ""}]);
	const [pics, setPics] = useState([{currPlayerURL: "", lastPlayerURL: ""}]);
	const [score, setScore] = useState(0);

	const [players, setPlayers] = useState([]);
	const [difficulty, setDifficulty] = useState('normal');

	const[guesses, setGuesses] = useState(5);

	const [optimalPath, setOptimalPath] = useState([]);
    const [roundPath, setRoundPath] = useState([]);
	const { colorMode, toggleColorMode } = useColorMode();

	const [blind, setBlind] = useState(false);
	console.log("blind mode is", blind);
	useEffect(() => {
		// Using fetch to fetch the api from flask server it will be redirected to proxy
		fetch("/players/" + difficulty)
			
			.then(
				(res) => {

					if (!res.ok)
						throw new Error(`HTTP error! status: ${res.status}`);

					return res.json();
				}
			)
	
			.then(
				(data) => {
                    setScore(0)
					setData(
						{
							currPlayer: data["Player 1"]["name"], lastPlayer: data["Player 2"]["name"],
							currPlayerID : data["Player 1"]["id"], lastPlayerID: data["Player 2"]["id"]
						}
					);
					setPics({currPlayerURL: data["Player 1"]["picture_url"], lastPlayerURL: data["Player 2"]["picture_url"]});
				
					setOptimalPath(data['Path']);
					console.log(data['Path']);

					//adding initial player to player list
					setPlayers([data["Player 1"]["name"]]);
                    setRoundPath([data["Player 1"]["id"]]);

				}
			)

			.catch((error) => {console.error("Error fetching data:", error);});
	}, [difficulty]);

    useEffect(() => {
        gsap.fromTo('#curr-image', {borderColor: '#6ba9fa'}, {borderColor: '#ffffff', duration: 1})
    },[data])

	const { isOpen: isRulesOpen , onOpen: onRulesOpen, onClose: onRulesClose } = useDisclosure()
    const { isOpen: isWinOpen , onOpen: onWinOpen, onClose: onWinClose } = useDisclosure()
    const { isOpen: isLoseOpen , onOpen: onLoseOpen, onClose: onLoseClose } = useDisclosure()


	return (
		<>
			<Flex minWidth='100%' alignItems='center' justifyContent="space-between" py='10px' px='20px'>
				<Flex alignItems='center' gap={3}>
					<a href="/"><Image src={logoImage} boxSize='80px' objectFit='cover'/></a>
					<Heading fontWeight='bold' fontSize='2xl'>Hoops Head 2 Head</Heading>
				</Flex>
				<Flex alignItems='center' gap={3}>
					<IconButton
						onClick={toggleColorMode}
						icon={colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
					>
						Toggle {colorMode === 'light' ? 'Dark' : 'Light'}
					</IconButton>
					<QuestionOutlineIcon onClick={onRulesOpen} className="rules" boxSize={8} />
				</Flex>
			</Flex>
			<Container className='App-Container'>

				<DifficultyButton changeDifficulty={setDifficulty} difficulty={difficulty} blind={blind} setBlind={setBlind} />

				<GuessForm
					guesses={guesses}
					setGuesses={setGuesses}
					players={players}
					setPlayers={setPlayers}
					data={data}
					setData={setData}
					modalOpen={onWinOpen}
					score={score}
					setScore={setScore}
					pics={pics}
					setPics={setPics}
					gameMode={'single'}
					setRoundPath={setRoundPath}
				/>
				<Box>
					<Flex align="center">
						<Text>Remaining Guesses:</Text>
						{Array.from({ length: guesses }).map((_, index) => (
							<Box
								key={index}
								borderRadius="50%"
								bg="gray.500"
								w="1em"
								h="1em"
								mx={1}
							/>
						))}
					</Flex>
				</Box>

				<div className='path'>
					<VStack spacing={4} align="stretch">
					<Text fontSize='xl' fontWeight='bold'>Current Path:</Text>
					<Text fontWeight='bold'>{
						players.map(
							(player, index) => (
								<React.Fragment key={index}>
									{player}
									{index < players.length - 1 && <span role="img" aria-label="right arrow"> ➡️ </span>}
								</React.Fragment>
							)
						)
					}</Text>
					</VStack>
				</div>
		
				<div className='player-container'>
					<div className='player'> 
						<Text fontSize='xl' align= 'center'> Current Player </Text>
						<Image id='curr-image'
							src = {pics.currPlayerURL}
							fallbackSrc = {defaultImage} 
							bg = 'white'
							borderRadius='full'
							border='5px solid #ffffff'
							objectFit='contain' 
							boxSize='180'
						/>
						{blind === false && (
							<Text fontSize='xl' align= 'center'>{data.currPlayer} </Text>
						)}
					</div>

					<div className='player'> 
						<Text fontSize='xl' align= 'center'> Target Player </Text>
						<Image 
							src = {pics.lastPlayerURL}
							bg = 'white'
							borderRadius='full'
							fallbackSrc = {defaultImage} 
							border='5px solid #ffffff'
							objectFit='contain' 
							boxSize='180'
						/>
						{blind === false && (
							<Text fontSize='xl' align= 'center'> {data.lastPlayer} </Text>
						)}
					</div>
				</div>
				<div className='score-container'>
					<div className = "score-box">
						<Heading size='md'>Score: {score}</Heading>
					</div>
				</div>

				<Modal size='lg' blockScrollOnMount={false} isOpen={isWinOpen}>
					<ModalOverlay/>
					<ModalContent backgroundColor="green.500">
						<ModalHeader>YOU DID ITTTTTT!</ModalHeader>
						<ModalBody>
							<Image src={myImage} alt="Description of Image" />
							<Text mb='1rem'>
								Your path was:
								<Text fontWeight='bold'>{players.map((player, index) => (
									<React.Fragment key={index}>
										{player}
										{index < players.length - 1 && ' ➡️ '}
									</React.Fragment>
								))}</Text>
								<br />
								The shortest path was:
								<Text fontWeight='bold'>{optimalPath.map((player, index) => (
									<React.Fragment key={index}>
										{player}
										{index < players.length - 1 &&' ➡️ '}
									</React.Fragment>
								))}</Text>
							</Text>

							<Text mb='1rem'>
								Score: <Text as="span" fontWeight='bold'>{score}</Text>
							</Text>
						</ModalBody>

						<ModalFooter>
							<Button colorScheme='blue' onClick={() => window.location.reload()}>Play Again</Button>
						</ModalFooter>
					</ModalContent>
				</Modal>

				<RulesModal onOpen={onRulesOpen} onClose={onRulesClose} isOpen={isRulesOpen}/>
				
				<Modal size='lg' closeOnOverlayClick={false} isOpen={guesses===0 && !isWinOpen}>
					<ModalOverlay/>
					<ModalContent backgroundColor="red.500">
						<ModalHeader>It's never been more over</ModalHeader>
						<ModalBody>
							<Image src={loseImage} alt="Description of Image" />
							<Text mb='1rem'>
								Your path was:
								<Text fontWeight='bold'>{players.map((player, index) => (
									<React.Fragment key={index}>
										{player}
										{index < players.length - 1 && ' ➡️ '}
									</React.Fragment>
								))}</Text>
								<br />
								The shortest path was:
								<Text fontWeight='bold'>{optimalPath.map((player, index) => (
									<React.Fragment key={index}>
									{player}
									{index < optimalPath.length - 1 && ' ➡️ '}
									</React.Fragment>
								))}</Text>
							</Text>

							<Text mb='1rem'>
								Score: <Text as="span" fontWeight='bold'>{score}</Text>
							</Text>
						</ModalBody>

						<ModalFooter>
							<Button colorScheme='blue' onClick={() => window.location.reload()}>Play Again</Button>
						</ModalFooter>
					</ModalContent>
				</Modal>
				
			</Container>		
		</>
	)
}

export default SinglePlayer;

                    