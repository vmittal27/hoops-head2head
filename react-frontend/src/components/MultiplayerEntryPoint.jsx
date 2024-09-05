import {Heading, Box, Button, Text, NumberInput, NumberInputField} from '@chakra-ui/react'
import { Form } from "react-router-dom";
import "../css/Multiplayer.css"
function MultiplayerEntryPoint({handleClick, handleSubmit, roomId, setRoomId}) {
    return (
        <>
            <Heading fontWeight='bold' size='lg'> Multiplayer </Heading>
            <Box className="Menu-Box">
                <Button className="Menu-Element" colorScheme="teal" size='lg' onClick={handleClick}>Create a Room</Button>
                <Form className='Form' onSubmit={handleSubmit}>
                    <Text fontSize='xl'>Join a Room</Text>
                    <NumberInput className='Menu-Element' colorScheme="teal" size='lg' min={100001} max={999999}>
                        <NumberInputField placeholder="Room ID" value={roomId} onChange={(e) => setRoomId(e.target.value)}/>
                    </NumberInput>
                    <Button className="Menu-Element" colorScheme="teal" size='lg' type="submit" isDisabled={!roomId}>Join Room</Button>
                </Form>
            </Box>
        </>

    )
}

export default MultiplayerEntryPoint
