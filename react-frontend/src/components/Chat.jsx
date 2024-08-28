import { useEffect, useState } from "react";
import { Heading, UnorderedList, ListItem, Input, InputGroup, InputRightElement, Container, Button, DarkMode } from "@chakra-ui/react";

export default function Chat({ socket }) {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  const handleText = (e) => {
    setMessage(e.target.value);
  };

  const handleSubmit = () => {
    if (!message) return;
    socket.emit("data", message);
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

    socket.on("data", handleIncomingData);

    // Cleanup function to remove the listener
    return () => {
      socket.off("data", handleIncomingData);
    };
  }, [socket]);

  return (
    <div>
  
    <Container bg='var(--chakra-colors-chakra-subtle-bg)' h='300px' minW='650px' position='absolute' top='130%' bottom='3%' right= '2%'  borderRadius='20px' borderWidth='3px' borderColor= 
    '#ff7f26' >
      <Heading size='lg' mt='10px'>Chat</Heading>
      <UnorderedList styleType="''" mt='10px' overflowY='auto' maxHeight='120px'>
        {messages.map((message, ind) => (
          <ListItem key={ind}>
            Guest {message[1].substring(0, 5)}: {message[0]}
          </ListItem>
        ))}
      </UnorderedList>
      <InputGroup position='absolute' bottom='23%' right='1.6%' maxW='625px'>
        <Input 
            position='absolute'
            placeholder='Enter Message'
            pr='4.5 rem'
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
    
    </div>
  );
}
