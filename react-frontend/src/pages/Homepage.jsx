import {React, useState, useEffect} from 'react'
import { Container, Button, Heading, Image } from '@chakra-ui/react'
import { Link } from 'react-router-dom'
import { Flex, useDisclosure} from '@chakra-ui/react'
import logoImage from '../components/hoopsh2hlogo1-removebg-preview.png'
import gordonRightImg from '../components/gordon.png'
import lavineLeftImg from '../components/lavine.png'
import "../css/Homepage.css"
import { IconButton, useColorMode} from "@chakra-ui/react";
import { MoonIcon, SunIcon, QuestionOutlineIcon } from '@chakra-ui/icons'
import { keyframes } from '@chakra-ui/react'
import RulesModal from '../components/RulesModal'


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

	const fadeIn = keyframes`
		from {opacity: 0;}
		to {opacity: 1;}
	`;

	const slideInLeft = keyframes`
		from {transform: translateX(-100vw); opacity: 1;}
		to {transform: translateX(0); opacity: 1;}
	`;

	const slideInRight = keyframes`
		from {transform: translateX(100vw); opacity: 1;}
		to {transform: translateX(0); opacity: 1;}
	`;



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
			<RulesModal onOpen={onRulesOpen} onClose={onRulesClose} isOpen={isRulesOpen}/>
			<Container
				display='flex'
				flexDirection='column'
				justifyContent='center'
				alignItems='center'
			>
				<Heading
					size='xl'
					textAlign='center' 
					mb='3vh'
					animation={`${fadeIn} 1s ease-in-out forwards`}
				>
					Welcome to Hoops Head 2 Head
				</Heading>
				<Flex flexDirection='row' justifyContent='center' alignItems='center' gap='5vw'>
					{wideScreen(800) ? 
					(
						<>
							<Image src={lavineLeftImg} opacity={0} boxSize='30vw' animation={`${slideInLeft} 0.5s ease-in-out 1s forwards`}/>
							<Flex
								flexDirection='column'
								width='fit-content'
								bg={colorMode === 'light' ? '#d1d6de' : 'var(--chakra-colors-chakra-subtle-bg)'}
								gap='2em' padding='2em'
								borderRadius='0.938rem'
								opacity={0}
								animation={`${fadeIn} 0.5s ease-in-out 1s forwards`}
								style={{animationFillMode: 'forwards', pointerEvents: 'auto'}}
							>
								<Link to='/singleplayer' ><Button colorScheme='blue' flex='1'size='lg' width='10em' minHeight='4rem'>Single Player</Button></Link>
								<Link to='/multiplayer'><Button flex='1' size='lg' colorScheme='purple' width='10em' minHeight='4rem'>Multiplayer</Button></Link>
                                <Button flex='1' size='lg' colorScheme='teal' width='10em' minHeight='4rem' onClick={onRulesOpen}>How to Play</Button>
							</Flex>
							<Image src={gordonRightImg} opacity={0} boxSize='30vw'  animation={`${slideInRight} 0.5s ease-in-out 1s forwards`}/>
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
								opacity={0}
								animation={`${fadeIn} 0.5s ease-in-out 1s forwards`}
							>
								<Link to='/singleplayer' ><Button colorScheme='teal' flex='1'size='lg' width='10em' minHeight='4rem'>Single Player</Button></Link>
								<Link to='/multiplayer'><Button flex='1' size='lg' colorScheme='teal' width='10em' minHeight='4rem'>Multiplayer</Button></Link>
							</Flex>
						</>
					)}
				</Flex>
			</Container>
		</>
        
    )
}

export default Homepage;