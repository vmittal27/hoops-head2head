import React, { useState, useEffect } from 'react'


function Scoreboard({setRoundFinished}) {
    useEffect (() => {
        setRoundFinished(true);
    },[]);
    return (
        <div>
            <p> Time's Up!
                SCOREBOARD: </p>
        </div>
    )
}

export default Scoreboard

