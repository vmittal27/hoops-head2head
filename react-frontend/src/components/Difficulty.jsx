import React, { useState, useRef, useEffect} from 'react'
import { Button, ButtonGroup } from '@chakra-ui/react'
import '../css/SinglePlayer.css'


const DifficultyButton = ({ changeDifficulty, difficulty, roomId}) => {
    const handleDifficultyChange = (newDifficulty) => {
        changeDifficulty(newDifficulty);
        // Emit the difficulty change to the server
        socket.emit('difficulty_changed', { room_id: roomId, difficulty: newDifficulty });
    };
    return (
      <div>
        <ButtonGroup className='difficulty-buttons-group'>
            <Button className={difficulty === 'easy' ? "selected-difficulty-button": "difficulty-button"} onClick={() => changeDifficulty('easy')}>Easy</Button>
            <Button className={difficulty === 'medium' ? "selected-difficulty-button": "difficulty-button"} onClick={() => changeDifficulty('medium')}>Medium</Button>
            <Button className={difficulty === 'hard' ? "selected-difficulty-button": "difficulty-button"} onClick={() => changeDifficulty('hard')}>Hard</Button>
            <Button className={difficulty === 'extreme' ? "selected-difficulty-button": "difficulty-button"} onClick={() => changeDifficulty('extreme')}>Extreme</Button>
            <Button className={difficulty === 'legacy' ? "selected-difficulty-button": "difficulty-button"} onClick={() => changeDifficulty('legacy')}>Legacy</Button>
        </ButtonGroup>
      </div>
    );
};

export default DifficultyButton;




