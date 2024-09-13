import { StatNumber, Stat } from "@chakra-ui/react";
import React, { useState, useRef, useEffect } from "react";

const Timer = ({endTime, setTimerFinished}) => { // endTime must be a date object
    const Ref = useRef(null); 
    const [timer, setTimer] = useState("00:00");

    const getTimeRemaining = (e) => {
        const total = Date.parse(e) - Date.parse(new Date()); 
        const seconds = Math.floor((total / 1000) % 60);
        const minutes = Math.floor(
            (total / 1000 / 60) % 60
        );

        return {total, seconds, minutes}; 
    }; 

    const iterateTimer = (e) => {
        let {total, seconds, minutes} = getTimeRemaining(e); 
        if (total >= 0) {
            setTimer((minutes > 9 ? minutes : "0" + minutes) + ":" + (seconds > 9 ? seconds: "0" + seconds)); 
        }
        if (total <= 0) {
            setTimerFinished(true);
        }
    }

    const startTimer = (e) => {
 
        const id = setInterval(() => {
            iterateTimer(e);
        }, 1000);
        Ref.current = id;
    };

    useEffect(() => {
        iterateTimer(endTime);
        startTimer(endTime);
        return () => clearInterval(Ref.current);
    }, [endTime]); 
    
    return (
        <div>
            <Stat><StatNumber>{timer}</StatNumber></Stat>
        </div>
    );
}

export default Timer; 