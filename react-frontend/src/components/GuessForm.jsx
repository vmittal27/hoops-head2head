import React, { useState, useRef} from 'react'
import SearchBar from './SearchBar'
import { FormControl, FormLabel, useToast} from '@chakra-ui/react'
import Select from "react-select"

const GuessForm = ({guesses, setGuesses, players, setPlayers, data, setData, modalOpen, score, setScore}) => {

    const API_BASE_URL = "http://localhost:5000"

    const [wrongStreak, setWrongStreak] = useState(0); 
    const [guess, setGuess] = useState(""); 

    const toast = useToast();

    const processScoring = (teammates) => {
        if (teammates) {
            fetch(
                `${API_BASE_URL}/scoring`, 
                {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({ player1_name: data.currPlayer, player2_name: guess })
                }
            )
                .then(scoreResponse => scoreResponse.json())
                .then(scoreResponse => {
                    console.log(scoreResponse);
                    const gPlayed = scoreResponse['Weight'];
                    const relevancy = scoreResponse['Relevancy'];
                    const addScore = ((0.7 * gPlayed / 1584) + (0.3 * relevancy / 9.622)) * 50 + 100;
                    setScore(Math.ceil(score + addScore));
                    console.log(`New Score: ${score}`);
                })
                .catch(error => console.log('Error getting score:', error))
        }

        else {
            setScore(score + 50 + (10 * wrongStreak));
            setWrongStreak(wrongStreak + 1);
        }

    }

    const checkTeammates = async (p1, p2) => {
        return fetch(
            `${API_BASE_URL}/check`,
            {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ player1_name: p1, player2_name: p2})
            }
        )
            .then((response) => response.json())
            .then((response) => {
                console.log(response.areTeammates);
                return response.areTeammates; 
            })
            .catch(error => console.log('Error checking teammates:', error))
    }

    const handleSubmit = (guess) => {

        if (guess) {
            console.log(`Guessed ${guess}`); 
            setGuesses(guesses - 1)

            checkTeammates(data.currPlayer, guess)
                .then((teammates) => {
                    if (teammates) {
                        setWrongStreak(0);
                        setPlayers(p => [...p,  guess]);
                        console.log(players);
                        setData({...data, currPlayer: guess})
                        console.log(data);

                        checkTeammates(data.lastPlayer, guess)
                            .then((gameOver) => {
                                if (gameOver) {
                                    console.log('Game Complete! Well done!');
                                    setPlayers(p => [...p, data.lastPlayer])
                                    modalOpen();
                                }
                            })
                    }
                
                    processScoring(teammates);
                    setGuess('');
                }); 
        }
        else {
            console.log("user submitted nothing"); 
            toast({
                title: "Please select a player!",
                status: "error", 
                variant: "subtle",
                isClosable: true, 
                duration: 800

            });
        }
    }

    // for search bar

    const [suggestions, setSuggestions] = useState([]);
    const [isLoading, setIsLoading] = useState(false); 
    const selectRef = useRef();
    // const [value, setValue] = useState("");

    const autocomplete = (inputValue) => {
        if (inputValue) {
            setIsLoading(true)
            fetch(`http://localhost:3000/autocomplete?search=${inputValue}`)
                .then((response) => response.json())
                .then((data) =>{
                    const results = []
                    for (var key in data) {
                        results.push({label: `${data[key][1]} (${data[key][0]})`, value: data[key][1]})
                    }
                    setSuggestions(results)
                })

                setIsLoading(false);
            // setValue(inputValue);
        }
    }

    const handleChange = (option) => {
        if (option) {
            setGuess(option.value);
            selectRef.current.clearValue();
            handleSubmit(option.value); 
        }
    }

    return (
        // <form onSubmit={handleSubmit}>
        //     <FormControl>
        //     <FormLabel>Teammate:</FormLabel>
        //     {/* <SearchBar guess={guess} setGuess={setGuess} onKeyDown={handleSubmit} /> */}
        //     <input type="submit" value="Check Connection"/> 
        //     </FormControl>
        // </form>
        <Select
        ref={selectRef}
        placeholder="Enter a Player's Name..."
        onInputChange={autocomplete}
        isSearchable="true"
        isClearable="true"
        isLoading={isLoading}
        options={suggestions}
        onChange={handleChange}
        closeMenuOnSelect="true"
        />
    )
}

export default GuessForm;