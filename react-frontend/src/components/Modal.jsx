import React, { useState } from 'react';
import './Modal.css'
//Note: this modal component is temporary. We will make a better looking one in the future

export default function Modal() {
    const [toggle, setToggle] = useState(false); //Temporary; for displaying modal

    const modalOn = () => {
        setToggle(True)
    }

    const modalOff = () => {
        setToggle(False)
        location.reload
    }

    return (
        <>
        
        <div className="modal">
            <div className="overlay"></div>
            <div className="modal-cotent">
                <h2>Game Complete!</h2>
                <p>
                    You connected the two players! Press restart to play again.
                </p>
                <button 
                className="close-modal"
                onClick={modalOff}>
                RESTART</button>
            </div>
        </div>

        </>
    )
}