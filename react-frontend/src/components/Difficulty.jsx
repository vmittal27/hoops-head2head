import React, { useState, useRef, useEffect} from 'react'
import { Button, ButtonGroup, Switch, VStack } from '@chakra-ui/react'
import '../css/SinglePlayer.css'


const DifficultyButton = ({ changeDifficulty, difficulty, roomId, blind, setBlind }) => {
    const handleDifficultyChange = (newDifficulty) => {
        changeDifficulty(newDifficulty);
        // Emit the difficulty change to the server
        socket.emit('difficulty_changed', { room_id: roomId, difficulty: newDifficulty });
    };
    return (  
      <VStack align="flex-start" spacing={4} className='difficulty-buttons-group'>
        <ButtonGroup className='difficulty-buttons-group'>
            <Button className={difficulty === 'normal' ? "selected-difficulty-button": "difficulty-button"} onClick={() => changeDifficulty('normal')}>Normal</Button>
            <Button className={difficulty === 'hard' ? "selected-difficulty-button": "difficulty-button"} onClick={() => changeDifficulty('hard')}>Hard</Button>
            <Button className={difficulty === 'legacy' ? "selected-difficulty-button": "difficulty-button"} onClick={() => changeDifficulty('legacy')}>Legacy</Button>
        </ButtonGroup>
        <Switch isChecked={blind} onChange={() => setBlind((oldBlind) => !oldBlind)}>
            Hide Player Names?
        </Switch>
      </VStack>
    );
};

export default DifficultyButton;




