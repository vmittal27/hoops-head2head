import React, { useState, useEffect } from 'react'


function App() {
  const [data, setData] = useState([{
    player1: "",
    player2: ""
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
                player1: data["Player 1"]["name"],
                player2: data["Player 2"]["name"]
            });
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
      body: JSON.stringify({ player1_name: data.player1, player2_name: userInput })
    })
    .then(response => response.json())
    .then(response => {
        const getBool = response[0].areTeammates;
        setAreTeammates(getBool); 
      })
      .catch(error => console.error('Error finding teammates:', error));
    };
  
//   console.log(data);
//   console.log('hello');

  
  return (
      <div>
        <p> HoopsHead2Head Demo</p>
        <p> Player 1: {data.player1} </p>
        <form onSubmit={checkIfTeammates}>
          <label for="fname">Teammate:</label><br></br>
          <input type="text" id="fname" name="fname" value={userInput} onChange={e => setUserInput(e.target.value)} /><br />
          <input type="submit" value="Check if Teammates"/> 
        </form>
        <p>{String(areTeammates)}</p>
        <p> Player 2: {data.player2} </p>
      </div>
  )
}

export default App;
