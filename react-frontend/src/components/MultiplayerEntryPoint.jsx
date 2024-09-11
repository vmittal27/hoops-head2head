import {Heading, Box, Button, Text, NumberInput, NumberInputField, Input, InputGroup, InputRightElement, FormControl, FormLabel, FormErrorMessage, FormHelperText} from '@chakra-ui/react'
import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
} from '@chakra-ui/react'
import { Form } from "react-router-dom";
import { useState } from 'react';
import "../css/Multiplayer.css"
function MultiplayerEntryPoint({handleClick, handleSubmit, roomId, setRoomId, username, setUsername}) {
    const [currName, setCurrName] = useState('');
    const [submitted, setSubmitted] = useState(!!localStorage.getItem('username'));

    const handleText = (e) => {
        setCurrName(e.target.value);
    };

    const userSubmit = () => {
        setUsername(currName);
        localStorage.setItem('username', currName); 
        setSubmitted(true);
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !isError) {
          userSubmit();
        }
      };
    
      const handleChangeUsername = () => {
        setCurrName('');
        localStorage.removeItem('username');
        setSubmitted(false);
      };

    const isError = currName === ''

    return (
        <>
            <Modal isOpen={!(submitted)} closeOnOverlayClick={false} isCentered={true} size='lg'>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader textAlign='center'>
                        Enter Username
                    </ModalHeader>
                    <ModalBody display='flex' flexDirection='row' alignItems='center' gap='1em'>
                    <FormControl isInvalid={isError}>
                        <InputGroup>
                            <Input 
                                value={currName}
                                type='text' 
                                placeholder='Enter Username'
                                onChange={handleText} 
                                onKeyDown={handleKeyDown}/>
                            <InputRightElement width='4.5rem'>
                                <Button 
                                    onClick={userSubmit}
                                    isDisabled={isError}>
                                    Enter
                                </Button>
                            </InputRightElement>
                        </InputGroup>
                        {!isError ? (
                            <FormHelperText>
                             
                            </FormHelperText>
                        ) : (
                            <FormErrorMessage>Username is required.</FormErrorMessage>
                        )}
                    </FormControl>
                    </ModalBody>
                    <ModalFooter>
                    </ModalFooter>
                </ModalContent>
            </Modal>
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
                <Text> Username: {username}</Text>
                <Button onClick={handleChangeUsername} variant='link'>Change Username</Button>
            </Box>
        </>

    )
}

export default MultiplayerEntryPoint
