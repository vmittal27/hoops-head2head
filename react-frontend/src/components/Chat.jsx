import { useEffect, useState } from "react";
import { Heading, UnorderedList, ListItem, Input, InputGroup, InputRightElement, Container, Button, DarkMode, Text, Flex } from "@chakra-ui/react";

export default function Chat({ idToUser, socket, roomId }) {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  const handleText = (e) => {
    setMessage(e.target.value);
  };

  const handleSubmit = () => {
    if (!message) return;
    socket.emit("message", {'room_id': roomId, 'message': message});
    setMessage("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSubmit();
    }
  };

  useEffect(() => {
    // Using `once` to handle the event only once per emission
    const handleIncomingData = (data) => {
      setMessages((prevMessages) => [...prevMessages, [data.data, data.id]]);
    };

    socket.on("message", handleIncomingData);

    // Cleanup function to remove the listener
    return () => {
      socket.off("message", handleIncomingData);
    };
  }, [socket]);



  return (
    <Container bg='var(--chakra-colors-chakra-subtle-bg)' flex='1' overflowX='auto' minHeight='20rem' float='right' overflow-x= 'hidden' maxWidth='100%'position='relative'borderRadius='20px' borderWidth='3px' borderColor='#ff7f26' >
      <Heading size='lg' mt='10px'>Chat</Heading>
      <UnorderedList styleType="''" mt='10px' overflowY='auto' maxHeight='120px'>
      </UnorderedList>
      <UnorderedList styleType="''" mt='10px' overflowY='auto' maxHeight='120px'>
        {messages.map((message, ind) => (
            <ListItem key={ind} textAlign="left">
                <Text as='span'><Text as='span' fontWeight='bold'>{idToUser[message[1]]}: </Text>{message[0]}</Text>
            </ListItem>
        ))}
    </UnorderedList>
      <InputGroup width='95%' position='absolute' top='14rem'>
        <Input 
            position='absolute'
            placeholder='Enter Message'
            pr='4.5rem'
            mb='10px'
            mt='10px'
            variant='outline'
            type="text" 
            value={message} 
            onChange={handleText} 
            onKeyDown={handleKeyDown} 
        />
        <InputRightElement width='4.5rem'>
            <Button onClick={handleSubmit} h='1.75rem' size='sm' mt='20px'>
                Send
            </Button>
        </InputRightElement>
      </InputGroup>
    </Container>
  );
}
