import { useEffect, useState } from "react";
import { UnorderedList, ListItem, Input } from "@chakra-ui/react";

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
      <h2>Chat</h2>
      <Input 
        type="text" 
        value={message} 
        onChange={handleText} 
        onKeyDown={handleKeyDown} 
      />
      <button onClick={handleSubmit}>Send</button>
      <UnorderedList styleType="''">
        {messages.map((message, ind) => (
          <ListItem key={ind}>
            Guest {message[1].substring(0, 5)}: {message[0]}
          </ListItem>
        ))}
      </UnorderedList>
    </div>
  );
}
