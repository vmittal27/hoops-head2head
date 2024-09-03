import React, { useState, useEffect } from 'react'
import { Heading, List, ListItem, Flex, Container } from "@chakra-ui/react";
import "../css/Scoreboard.css"



function Scoreboard({scores}) { 
    // useEffect (() => {
    //     setRoundFinished(true);
    // },[]);
    const sortedDict = Object.fromEntries(
        Object.entries(scores).sort(([,a],[,b]) => b-a)
    );
    return (
        <Container className='Scoreboard-Container'>
            <List fontWeight="bold" styleType="none" fontSize="xl" mx="10px">
                {Object.keys(sortedDict).map((player_id) => (
                <ListItem>
                    <Flex alignItems='center'>
                        <span fontSize='xl'>Guest {player_id.substring(0, 5)}</span>
                        <Heading fontWeight='bold'fontSize='xl' className='score'>{scores[player_id]}</Heading>
                    </Flex>
                </ListItem>
                ))}
            </List>
            </Container>
    )
}

export default Scoreboard

