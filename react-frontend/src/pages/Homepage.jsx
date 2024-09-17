import React from 'react'
import { Container, Button, Heading, Image, Box, Text } from '@chakra-ui/react'
import { Link } from 'react-router-dom'
import { Tabs, TabList, TabPanels, Tab, TabPanel } from '@chakra-ui/react'
import { VStack, UnorderedList, ListItem } from '@chakra-ui/react'
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
import "../css/Homepage.css"


function Homepage() {

    const { isOpen: isRulesOpen , onOpen: onRulesOpen, onClose: onRulesClose } = useDisclosure()

    return (
        <Container className='maincontain'>
            <Heading pos='relative'>Welcome to Hoops Head 2 Head!</Heading>
            <Container className='Homepage-Contain'>
                <Link to='/singleplayer' ><Button flex='1'size='lg' variant='outline' className='Gamemode-Button'>Single Player</Button></Link>
                <Image flex='1' src={logoImage} boxSize='250' objectFit='cover' />
                <Link to='/multiplayer'><Button flex='1' size='lg' variant='outline' className='Gamemode-Button'>Multiplayer</Button></Link>
            </Container>
            <Button onClick={onRulesOpen} flex='1'size='lg'variant='outline' className='Gamemode-Button'>Rules</Button>
            <Container>
            </Container>




            
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



        
    )
}

export default Homepage