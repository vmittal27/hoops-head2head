import React, { useState, useEffect } from 'react'
import { Heading, List, ListItem, Flex } from "@chakra-ui/react";


function Scoreboard({scores}) { 
    // useEffect (() => {
    //     setRoundFinished(true);
    // },[]);
    const sortedDict = Object.fromEntries(
        Object.entries(scores).sort(([,a],[,b]) => b-a)
    );
    return (
        <div>
            <p> Time's Up! </p>
            <p> Scoreboard: </p>
                <List styleType="''" textAlign='left' fontSize='lg' mx='10px'>
                    {Object.keys(sortedDict).map((player_id) => {
                        return <ListItem >Guest {player_id.substring(0,5)} : {scores[player_id]} </ListItem>;
                    })}
				</List>
        </div>
    )
}

export default Scoreboard

