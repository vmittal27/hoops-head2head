import React, { useState, useEffect } from 'react'


function App() {
  const [data, setData] = useState([{
    player1: "",
    player2: ""
}])

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
  console.log(data);
  console.log('hello');
  return (
      <div>
        <p> HoopsHead2Head Demo</p>
        <p> Player 1: {data.player1} </p>
        <p> Player 2: {data.player2} </p>
      </div>
  )
}

export default App
