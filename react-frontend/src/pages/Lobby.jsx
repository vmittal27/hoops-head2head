import React from 'react'
import { Container, Button, Heading, Image, Box } from '@chakra-ui/react'
import { Link } from 'react-router-dom'
import io from 'socket.io-client';

const socket = io('ws://localhost:5000'); // Replace with your Flask server URL

socket.on('connect', () => {
  console.log(`Connected to WebSocket server`);
});


socket.on('response', (data) => {
  console.log('Received response:', data);
});

socket.emit('message', 'Hello from client');



function Lobby() {

    return(
        <div>
            <p> type shit </p>
        </div>
    )
}


export default Lobby