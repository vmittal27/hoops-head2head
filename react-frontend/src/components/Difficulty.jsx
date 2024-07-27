import React, { useState, useRef, useEffect} from 'react'
import { Button, ButtonGroup } from '@chakra-ui/react'



const DifficultyButton = ({ changeDifficulty }) => {
    return (
      <div>
        <ButtonGroup position='relative' right='100'>
            <Button className="difficulty-button" onClick={() => changeDifficulty('easy')}>Easy</Button>
            <Button className="difficulty-button" onClick={() => changeDifficulty('medium')}>Medium</Button>
            <Button className="difficulty-button" onClick={() => changeDifficulty('hard')}>Hard</Button>
            <Button className="difficulty-button" onClick={() => changeDifficulty('extreme')}>Extreme</Button>
            <Button className="difficulty-button" onClick={() => changeDifficulty('legacy')}>Legacy</Button>
        </ButtonGroup>
      </div>
    );
};

export default DifficultyButton





