import React, { useState, useRef, useEffect} from 'react'



const changeDifficulty = ({difficulty, setDifficulty}) => {
    return(
        <div>
            <button onClick = {() => setDifficulty(difficulty)} >
                {difficulty}
            </button>
        </div>
    )
}

const DifficultyButton = ({ changeDifficulty }) => {
    return (
      <div>
        <button className="difficulty-button" onClick={() => changeDifficulty('easy')}>Easy</button>
        <button className="difficulty-button" onClick={() => changeDifficulty('medium')}>Medium</button>
        <button className="difficulty-button" onClick={() => changeDifficulty('hard')}>Hard</button>
        <button className="difficulty-button" onClick={() => changeDifficulty('extreme')}>Extreme</button>
        <button className="difficulty-button" onClick={() => changeDifficulty('legacy')}>Legacy</button>
      </div>
    );
};

export default DifficultyButton





