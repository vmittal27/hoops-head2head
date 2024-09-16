import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { gsap } from 'gsap'
import './Difficulty'

import '../css/MultiplayerPlayScreen.css'
import GuessForm from './GuessForm'
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
import DifficultyButton from './Difficulty'

function Multiplayer({ data_m, pics_m, players_m, path_m, difficulty_m, time_m, setIsFinished, score, setScore, setRoundPath, setRoundGuessesUsed}) {
	const [data, setData] = useState(data_m)
	const [pics, setPics] = useState(pics_m)

	const [players, setPlayers] = useState(players_m)
	const [difficulty, setDifficulty] = useState(difficulty_m)
	const [timeLeft, setTimeLeft] = useState(time_m);

	const[guesses, setGuesses] = useState(5);

	const [optimalPath, setOptimalPath] = useState(path_m);

	useEffect(() => {
		console.log("useEffect running", data_m.currPlayerID);
		setRoundPath([data_m.currPlayerID]);
	}, [])

	useEffect(() => {
		setData(data_m);
		setPics(pics_m);
		setPlayers(players_m);
		setDifficulty(difficulty_m);
		setOptimalPath(path_m);
		setTimeLeft(time_m);
	  }, [data_m, pics_m, players_m, difficulty_m, path_m, time_m]);


    useEffect(() => {
        gsap.fromTo('#curr-image', {borderColor: '#6ba9fa'}, {borderColor: '#ffffff', duration: 1})
    },[data])

	const { isOpen: isRulesOpen , onOpen: onRulesOpen, onClose: onRulesClose } = useDisclosure()
    const { isOpen: isWinOpen , onOpen: onWinOpen, onClose: onWinClose } = useDisclosure()
    const { isOpen: isLoseOpen , onOpen: onLoseOpen, onClose: onLoseClose } = useDisclosure()

    // Checking if game end
    useEffect(() => {
		console.log(timeLeft)
        if (isWinOpen || guesses === 0 || time_m <= 0) {
            console.log("is finished")
			setIsFinished(true);
        }
    }, [guesses, players, timeLeft])

	return (
		<Container className='App-Container'>

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
				gameMode={'multi'}
				setRoundPath={setRoundPath}
				setRoundGuessesUsed={setRoundGuessesUsed}
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
				))}</Text>
                </VStack>
            </div>
			<div className='player-container'>
				<div className='player'> 
					<Text fontSize='xl' align= 'center'> Current Player </Text>
					<Image id='curr-image'
						src = {pics.currPlayerURL}
						bg = 'white'
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
						bg = 'white'
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
		</Container>		
			
	)
}

export default Multiplayer; 
