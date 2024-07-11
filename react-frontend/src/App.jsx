import React, { useState, useEffect } from 'react'
//import axios from 'axios'

let idIndex = 0

function App() {
  const [data, setData] = useState([{
    currPlayer: "",
    lastPlayer: ""
    //changed names to make it more clear what they are
}])

  const [players, setPlayers] = useState([])
  const [userInput, setUserInput] = useState("Enter Player"); 
  const [areTeammates, setAreTeammates] = useState("teammates?");

  
  useEffect(() => {
    // Using fetch to fetch the api from 
    // flask server it will be redirected to proxy
    fetch("http://localhost:5000/players/easy")
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
    fetch('http://localhost:5000/check', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ player1_name: data.currPlayer, player2_name: userInput })
    })
    .then(response => response.json())
    .then(response => {
        console.log(response)
        const getBool = response.areTeammates;
        setAreTeammates(getBool); 
        if (getBool) {
            setPlayers(p => [...p,  userInput])
            setData(
                {...data, currPlayer: userInput})
        }
      })
      .catch(error => console.error('Error finding teammates:', error));
    };
  
//   console.log(data);
//   console.log('hello');
  
  return (
      <div>
        <p> HoopsHead2Head Demo</p>
        <p> Player 1: {players[0]} </p>
        <form onSubmit={checkIfTeammates}>
          <label for="fname">Teammate:</label><br></br>
          <input type="text" id="fname" name="fname" value={userInput} onChange={e => setUserInput(e.target.value)} /><br />
          <input type="submit" value="Check if Teammates"/> 
        </form>
        <p>{String(areTeammates)}</p>
        <p> Player 2: {data.lastPlayer} </p>
        <h4>List of Players:</h4>
            <ul>
                {players.map((player, index) => <li key={index}>{player}</li>)}
            </ul>
      </div>
  )
}

export default App;
