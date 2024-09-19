import React from 'react'
import { Heading, List, ListItem, Flex, Container, Text, VStack, Box } from "@chakra-ui/react";
import "../css/Scoreboard.css"



function Scoreboard({scores, idToUser}) { 

    const sortedDict = Object.fromEntries(
        Object.entries(scores).sort(([,a],[,b]) => b-a)
    );

    return (    
        <Box
            borderRadius='0.63em'
            bg='var(--chakra-colors-chakra-subtle-bg)'
            width='30vw'
            borderColor='#ff7f26'
            borderWidth='0.2rem'
            padding='1.3rem'
            display='flex'
            flexDir='column'
        >
            <Text fontSize='xl' fontWeight='bold'>Scoreboard</Text>
            <List fontWeight="bold" styleType="none" fontSize="xl" mx="10px">
                {Object.keys(sortedDict).map((player_id) => (
                    <ListItem>
                        <Flex flexDir='row' justifyContent='space-between'>
                            <Text>{idToUser[player_id]}</Text>
                            <Text fontWeight='bold'fontSize='xl'>{scores[player_id]}</Text>
                        </Flex>
                    </ListItem>
                ))}
            </List>
        </Box>
    )
}

export default Scoreboard;
