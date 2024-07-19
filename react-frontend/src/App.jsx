import React, { useState, useEffect } from 'react'
import './css/Modal.css' //Only need this for now, 
import './components/SearchBar'
import SearchBar from './components/SearchBar'
import { Container, FormControl, FormLabel, Heading, Text, UnorderedList, ListItem } from '@chakra-ui/react'
let idIndex = 0
let wrongStreak = 0

function App() {
  const [data, setData] = useState([{
    currPlayer: "",
    lastPlayer: ""
    //changed names to make it more clear what they are
}])

  // for search bar
  const [search, setSearchBar] = useState("");
  const [results, setResults] = useState([]);
  const [index, setIndex] = useState(null);
  const [score, setScore] = useState(0);

  const [players, setPlayers] = useState([])

  const [areTeammates, setAreTeammates] = useState("teammates?");
  const [toggle, setToggle] = useState(false); //Temporary; for displaying modal
  const[guesses, setGuesses] = useState(5)
  const API_BASE_URL = "http://localhost:5000/"

  
  useEffect(() => {
    // Using fetch to fetch the api from 
    // flask server it will be redirected to proxy
    fetch(API_BASE_URL + "players/easy")
        .then((res) =>{
          // Check if response is OK
          if (!res.ok) {
              throw new Error(`HTTP error! status: ${res.status}`);
          }
          // Log the raw response
          console.log("Raw response:", res);
          return res.json();
        })
        .then((data) => {
            // Setting a data from api
            console.log('fuck you');
            console.log(data);
            setData({
                currPlayer: data["Player 1"]["name"],
                lastPlayer: data["Player 2"]["name"]
            });
            //adding initial player to player list
            console.log('adding first player');
            setPlayers([data["Player 1"]["name"]]);
            console.log(players);
        })
        .catch((error) => {
          console.error("Error fetching data:", error);
      });
  }, []);

  const checkIfTeammates = (event) => {
    event.preventDefault();
    if (index !== null) {
      fetch(API_BASE_URL + 'check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ player1_name: data.currPlayer, player2_name: search })
      })
      .then(response => response.json())
      .then(response => {
          console.log(response);
          //checking if guess is valid
          const getBool = response.areTeammates;
          setGuesses(guesses - 1)
          setAreTeammates(getBool); 
          if (getBool) {
              wrongStreak = 0    
              setPlayers(p => [...p,  search])
              setData({...data, currPlayer: search})
              fetch(API_BASE_URL + 'scoring', {
                method: 'POST',
                  headers: {
                    'Content-Type': 'application/json'
                  },
                  body: JSON.stringify({ player1_name: data.currPlayer, player2_name: search })
              })
              .then(scoreResponse => scoreResponse.json())
              .then(scoreResponse => {
                console.log('adding correct pts')
                console.log(scoreResponse)
                const gPlayed = scoreResponse['Weight'];
                console.log(gPlayed)
                const relevancy = scoreResponse['Relevancy'];
                const addScore = ((0.7 * gPlayed / 1584) + (0.3 * relevancy / 9.622)) * 50 + 100;
                setScore(Math.ceil(score + addScore))
                console.log(score)
              })
              .catch (error => console.log('Error getting score:', error))
              //Now, running second fetch to see if guess is teammate of last player
              fetch(API_BASE_URL + 'check', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json'
                  },
                  body: JSON.stringify({ player1_name: data.lastPlayer, player2_name: search })
              })
              .then(responseTwo => responseTwo.json())
              .then(responseTwo => {
                  const boolDone = responseTwo.areTeammates;
                  if(boolDone) {
                      console.log('Game Complete! Well done!');
                      setToggle(true);
                  }
              });
          }
          else {
            setScore(score + 50 + (10 * wrongStreak));
            wrongStreak += 1;
          }
        })
        .catch(error => console.error('Error finding teammates:', error));
        setSearchBar('');
        setResults([]);
        setIndex(null);
      }
      else
        alert("Please select a valid player from the search bar!")
    };

  const modalOff = () => {
        setToggle(false)
        window.location.reload();
    }

  return (
      <Container>
        <Heading size='xl'> HoopsHead2Head Demo</Heading>
        <Text fontSize='xl'> Player 1: {players[0]} </Text>
        <form onSubmit={checkIfTeammates}>
          <FormControl>
            <FormLabel>Teammate:</FormLabel>
            <SearchBar search={search} setSearchBar={setSearchBar} results={results} setResults={setResults} index={index} setIndex={setIndex}/>
            <input type="submit" value="Check Connection"/> 
          </FormControl>
        </form>
        <Text>Remaining Guesses: {guesses}</Text>
        <Text fontSize='xl'> Player 2: {data.lastPlayer} </Text>
        <Heading size='md'>Score: {score}</Heading>
        <Heading size='md'>List of Players:</Heading>
            <UnorderedList>
                {players.map(player => <ListItem>{player}</ListItem>)}
            </UnorderedList>
        {toggle && (
        <div className="modal">
        <div className="overlay"></div>
        <div className="modal-content">
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
        )}
      </Container>
        
      
  )
}

export default App;
