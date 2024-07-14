import React, { useState, useEffect } from 'react'
import './components/Modal.css' //Only need this for now, 
//import axios from 'axios'
import './components/SearchBar'
import SearchBar from './components/SearchBar'
let idIndex = 0

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

  const [players, setPlayers] = useState([])

  const [areTeammates, setAreTeammates] = useState("teammates?");
  const [toggle, setToggle] = useState(false); //Temporary; for displaying modal
  const[guesses, setGuesses] = useState(5)
  const API_BASE_URL = "http://localhost:3000/"

  
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
          const getBool = response.areTeammates;
          setGuesses(guesses - 1)
          setAreTeammates(getBool); 
          if (getBool) {
              setPlayers(p => [...p,  search])
              setData({...data, currPlayer: search})
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
      <div>
        <p> HoopsHead2Head Demo</p>
        <p> Player 1: {players[0]} </p>
        <form onSubmit={checkIfTeammates}>
          <label for="fname">Teammate:</label><br></br>
          <SearchBar search={search} setSearchBar={setSearchBar} results={results} setResults={setResults} index={index} setIndex={setIndex}/>
          <input type="submit" value="Check Connection"/> 
        </form>
        <p>Remaining Guesses: {guesses}</p>
        <p> Player 2: {data.lastPlayer} </p>
        <h4>List of Players:</h4>
            <ul>
                {players.map((player, index) => <li key={index}>{player}</li>)}
            </ul>
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
      </div>
        
      
  )
}

export default App;
