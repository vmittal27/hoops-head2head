import React from 'react'
import { Container, Button, Heading, Image, Box } from '@chakra-ui/react'
import { Link } from 'react-router-dom'
import logoImage from '../components/hoopsh2hlogo1-removebg-preview.png'
import "../css/Homepage.css"

function Homepage() {

    return (
        <Container className='Homepage-Container'>
            <Box className='Homepage-Box'>
                <Heading pos='relative'>Welcome to Hoops Head 2 Head!</Heading>
                <Image src={logoImage} boxSize='200' objectFit='cover' />
                <Heading pos='relative' as='h3' size='lg'>Please select a game mode below</Heading>
                <br/>
                <Link to='/singleplayer'><Button>Single Player</Button></Link>
            </Box>
            <Container>
            </Container>
        </Container>
    )
}

export default Homepage