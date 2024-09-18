import {React, useState, useEffect} from 'react'
import { Container, Button, Heading, Image } from '@chakra-ui/react'
import { Link } from 'react-router-dom'
import { Flex, Tabs, TabList, TabPanels, Tab, TabPanel } from '@chakra-ui/react'
import { UnorderedList, ListItem} from '@chakra-ui/react'
import {
	Modal,
	ModalOverlay,
	ModalContent,
	ModalHeader,
	ModalFooter,
	ModalBody,
	ModalCloseButton,
	useDisclosure,
    Icon
} from '@chakra-ui/react'
import logoImage from '../components/hoopsh2hlogo1-removebg-preview.png'
import gordonRightImg from '../components/gordon.png'
import lavineLeftImg from '../components/lavine.png'
import "../css/Homepage.css"
import { IconButton, useColorMode} from "@chakra-ui/react";
import { MoonIcon, SunIcon, QuestionOutlineIcon } from '@chakra-ui/icons'



function Homepage() {

    const { isOpen: isRulesOpen , onOpen: onRulesOpen, onClose: onRulesClose } = useDisclosure()
	const { colorMode, toggleColorMode } = useColorMode();

	const wideScreen = (min) => {
		const [curWidth, setCurWidth] = useState(0);
		
		useEffect(() => {
		  function handleWindowResize() {
			setCurWidth(window.innerWidth);
		  }
		  
		  window.addEventListener("resize", (handleWindowResize));
		  
		  handleWindowResize();
		  
		  return () => { 
			window.removeEventListener("resize", handleWindowResize);
		  }
		}, [setCurWidth]);
		
		return curWidth > min;
	  }

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
			<Container
				display='flex'
				flexDirection='column'
				justifyContent='center'
				alignItems='center'
			>
				<Heading size='xl' textAlign='center' mb='3vh'>Welcome to Hoops Head 2 Head</Heading>
				<Flex flexDirection='row' justifyContent='center' alignItems='center' gap='5vw'>
					{wideScreen(800) ? 
					(
						<>
							<Image src={lavineLeftImg} boxSize='30vw'/>
							<Flex
								flexDirection='column'
								width='fit-content'
								bg='var(--chakra-colors-chakra-subtle-bg)'
								gap='2em' padding='2em'
								borderRadius='0.938rem'
							>
								<Link to='/singleplayer' ><Button colorScheme='teal' flex='1'size='lg' width='10em' minHeight='4rem'>Single Player</Button></Link>
								<Link to='/multiplayer'><Button flex='1' size='lg' colorScheme='teal' width='10em' minHeight='4rem'>Multiplayer</Button></Link>
							</Flex>
							<Image src={gordonRightImg} boxSize='30vw'/>
						</>
					): 
					(
						<>
							<Flex
								flexDirection='column'
								width='fit-content'
								bg='var(--chakra-colors-chakra-subtle-bg)'
								gap='2em' padding='2em'
								borderRadius='0.938rem'
							>
								<Link to='/singleplayer' ><Button colorScheme='teal' flex='1'size='lg' width='10em' minHeight='4rem'>Single Player</Button></Link>
								<Link to='/multiplayer'><Button flex='1' size='lg' colorScheme='teal' width='10em' minHeight='4rem'>Multiplayer</Button></Link>
							</Flex>
						</>
					)}
				</Flex>

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
												A higher score is better
											</ListItem>
											<ListItem>
												For correct guesses, obvious teammates add less points than guessing less well-known teammates do
											</ListItem>
											<ListItem>
												Incorrect guesses add 0 points, and each correct guess adds less points if more guesses are used
											</ListItem>
										</UnorderedList>
									</TabPanel>
								</TabPanels>
							</Tabs>
						</ModalBody>
						<ModalFooter/>
					</ModalContent>
				</Modal>

			</Container>
		</>
        
    )
}

export default Homepage