import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { gsap } from 'gsap'
import '../components/Difficulty'

import '../css/SinglePlayer.css'
import GuessForm from '../components/GuessForm'
import { QuestionOutlineIcon } from '@chakra-ui/icons'
import { IoHome } from "react-icons/io5";
import { VStack,Container, Heading, Text, UnorderedList, ListItem } from '@chakra-ui/react'
import { Tabs, TabList, TabPanels, Tab, TabPanel } from '@chakra-ui/react'
import {
	Modal,
	ModalOverlay,
	ModalContent,
	ModalHeader,
	ModalFooter,
	ModalBody,
	ModalCloseButton,
	useDisclosure,
	Button,
	Image,
    Icon
} from '@chakra-ui/react'

import myImage from '../components/wedidit.jpeg'
import logoImage from '../components/hoopsh2hlogo1-removebg-preview.png'
import defaultImage from '../components/default-pic.png'
import DifficultyButton from '../components/Difficulty'

function SinglePlayer() {
	const [data, setData] = useState([{currPlayer: "", lastPlayer: "", currPlayerID: "", lastPlayerID: ""}])
	const [pics, setPics] = useState([{currPlayerURL: "", lastPlayerURL: ""}])
	const [score, setScore] = useState(0);

	const [players, setPlayers] = useState([])
	const [difficulty, setDifficulty] = useState('easy')

	const[guesses, setGuesses] = useState(5)

	const [optimalPath, setOptimalPath] = useState([]);
	const API_BASE_URL = "http://localhost:5000/"
	
	useEffect(() => {
		// Using fetch to fetch the api from flask server it will be redirected to proxy
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
					setPlayers([data["Player 1"]["name"]]);
					console.log(players);

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
		<Container className='App-Container'>
            <div class='header'>
                <Link to='..'>
                <Image src={logoImage} boxSize = '150' objectFit='cover' position='relative'/>
                </Link>
                <Text fontWeight='bold' fontSize='3xl'> Hoops Head 2 Head </Text>
            </div>
			<Text fontWeight='bold' fontSize='xl'> Single Player Mode </Text>
			{/* <Text fontWeight='bold' fontSize='xl'> Current Difficulty: {difficulty[0].toUpperCase() + difficulty.slice(1)} </Text> */}
			<DifficultyButton changeDifficulty={setDifficulty} difficulty={difficulty} />

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
			/>
	
			<Text align= 'center'>Remaining Guesses: {guesses}</Text>

			<div className='path'>
                <VStack spacing={4} align="stretch">
				<Text fontSize='xl' fontWeight='bold'>Current Path</Text>
                <Text fontWeight='bold'>{players.map((player, index) => (
									<React.Fragment key={index}>
										{player}
										{index < players.length - 1 && <span role="img" aria-label="right arrow"> ➡️ </span>}
									</React.Fragment>
								))}
							</Text>
                </VStack>
            </div>
			<div className='player-container'>
				<div className='player'> 
					<Text fontSize='xl' align= 'center'> Current Player </Text>
					<Image id='curr-image'
						src = {pics.currPlayerURL}
						fallbackSrc = {defaultImage} 
						borderRadius='full'
						border='5px solid #ffffff'
						objectFit='contain' 
						boxSize='180'
					/>
					<Text fontSize='xl' align= 'center'>{data.currPlayer} </Text>
				</div>

				<div className='player'> 
					<Text fontSize='xl' align= 'center'> Target Player </Text>
					<Image 
						src = {pics.lastPlayerURL}
						borderRadius='full'
						fallbackSrc = {defaultImage} 
						border='5px solid #ffffff'
						objectFit='contain' 
						boxSize='180'
					/>
					<Text fontSize='xl' align= 'center'> {data.lastPlayer} </Text>
				</div>
			</div>
			<div className='right-container'>
				<QuestionOutlineIcon onClick={onRulesOpen} className = "rules" boxSize={8}/>

				<div className = "score-box">
					<Heading size='md'>Score: {score}</Heading>
				</div>
			</div>

			<Modal blockScrollOnMount={false} isOpen={isWinOpen} onClose={onWinClose}>
				<ModalOverlay/>
				<ModalContent backgroundColor="green.300">
					<ModalHeader>YOU DID ITTTTTT!</ModalHeader>
					<ModalCloseButton/>
					<ModalBody>
						<Image src={myImage} alt="Description of Image" />
						<Text mb='1rem'>
							Your path was:
							<Text fontWeight='bold'>{players.map((player, index) => (
									<React.Fragment key={index}>
										{player}
										{index < players.length - 1 && <span role="img" aria-label="right arrow"> ➡️ </span>}
									</React.Fragment>
								))}
							</Text>
							The shortest path was:
							<Text fontWeight='bold'>{optimalPath.map((player, index) => (
									<React.Fragment key={index}>
										{player}
										{index < players.length - 1 && <span role="img" aria-label="right arrow"> ➡️ </span>}
									</React.Fragment>
								))}
							</Text>
						</Text>
						<Text mb='1rem'>
							Score:<Text as="span" fontWeight='bold'>{score}</Text>
						</Text>
					</ModalBody>

					<ModalFooter>
						<Button variant='ghost' mr={3} onClick={onWinClose}>Close</Button>
						<Button colorScheme='blue' onClick={() => window.location.reload()}>Restart</Button>
					</ModalFooter>
				</ModalContent>
			</Modal>

            <Modal blockScrollOnMount={false} size ={'lg'} isOpen={isRulesOpen} onClose={onRulesClose}>
				<ModalOverlay/>
				<ModalContent>
					<ModalHeader>Rules</ModalHeader>
					<ModalCloseButton color="black"/>
					<ModalBody>
                    <Tabs variant='enclosed'>
                        <TabList>
                            <Tab>How to Play</Tab>
                            <Tab>Scoring</Tab>
                        </TabList>
                        <TabPanels>
                            <TabPanel>
                            <UnorderedList>
                                <ListItem>
                                    Connect two NBA players based on mutual teammates
                                </ListItem>
                                <ListItem>
                                    Complete the connection in as few guesses as possible
                                </ListItem>
                                <ListItem>
                                    The game ends when the connection is complete or you have exhausted all your guesses
                                </ListItem>
				            </UnorderedList>
                            </TabPanel>
                            <TabPanel>
                            <UnorderedList>
                                <ListItem>
                                    Lowest score wins
                                </ListItem>
                                <ListItem>
                                    For correct guesses, obvious teammates add more points than guessing less well-known teammates do
                                </ListItem>
                                <ListItem>
                                    Incorrect guesses add the most points, with more points being added for a streak of wrong guesses
                                </ListItem>
                                </UnorderedList>
                            </TabPanel>
                        </TabPanels>
                        </Tabs>

					</ModalBody>

					<ModalFooter>

					</ModalFooter>
				</ModalContent>
			</Modal>

			<Modal closeOnOverlayClick={false} isOpen={guesses===0} onClose={onLoseClose}>
				<ModalOverlay/>
				<ModalContent>
					<ModalHeader>Game Over!</ModalHeader>

					<ModalCloseButton />

					<ModalBody>
						<Text mb='1rem'>
							You ran out of guesses!
							<br/><br/>The shortest path was:<br/>
							<Text fontWeight='bold'>
								{optimalPath.join(' ➡️ ')}
							</Text>
						</Text>
					</ModalBody>

					<ModalFooter>
						<Button variant='ghost' mr={3} onClick={onLoseClose}>Close</Button>
						<Button colorScheme='blue' onClick={() => window.location.reload()}>Restart</Button>
					</ModalFooter>

				</ModalContent>
			</Modal>
		</Container>		
			
	)
}

export default SinglePlayer;
