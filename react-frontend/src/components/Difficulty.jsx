import React, { useState, useRef, useEffect} from 'react'
import { Button, ButtonGroup, Heading, Switch, VStack } from '@chakra-ui/react'
import '../css/SinglePlayer.css'


const DifficultyButton = ({ changeDifficulty, difficulty, roomId, blind, setBlind, isDisabled }) => {

    return (  
      <VStack className='difficulty-buttons-group'>
        <ButtonGroup className='difficulty-buttons-group'>
            <Button isDisabled={isDisabled} className={difficulty === 'normal' ? "selected-difficulty-button": "difficulty-button"} onClick={() => changeDifficulty('normal')}>Normal</Button>
            <Button isDisabled={isDisabled} className={difficulty === 'hard' ? "selected-difficulty-button": "difficulty-button"} onClick={() => changeDifficulty('hard')}>Hard</Button>
            <Button isDisabled={isDisabled} className={difficulty === 'legacy' ? "selected-difficulty-button": "difficulty-button"} onClick={() => changeDifficulty('legacy')}>Legacy</Button>
        </ButtonGroup>
        <Heading mt='0.5rem' textAlign='center' fontWeight='bold' size='md'>Hide Player Names <Switch isDisabled={isDisabled} isChecked={blind} onChange={() => setBlind((oldBlind) => !oldBlind)}></Switch></Heading>
      </VStack>
    );
};

export default DifficultyButton;




