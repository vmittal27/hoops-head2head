import React from 'react'
import { Container, Button, Heading, Image, Box } from '@chakra-ui/react'
import { Link } from 'react-router-dom'
import logoImage from '../components/hoopsh2hlogo1-removebg-preview.png'

function Homepage() {

    return (
        <Container>
            <Box pos='fixed' top='0'>
                <Heading pos='relative' right='100'>Welcome to Hoops H2H!</Heading>
                <Image src={logoImage} boxSize='200' objectFit='cover' />
            </Box>
            <Container>
                <Link to='/singleplayer'><Button>Single Player</Button></Link>
            </Container>
        </Container>
    )
}

export default Homepage