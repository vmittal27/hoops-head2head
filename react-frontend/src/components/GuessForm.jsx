import React, { useState} from 'react'
import {useToast, useColorModeValue} from '@chakra-ui/react'
import { useTheme } from '@chakra-ui/system'
import Select from "react-select"
import '../css/SinglePlayer.css'

const GuessForm = ({guesses, setGuesses, players, setPlayers, data, setData, modalOpen, score, setScore, pics, setPics}) => {

    const API_BASE_URL = "http://localhost:3000"

    const [wrongStreak, setWrongStreak] = useState(0); // for scoring

    // states for search bar
    const [value, setValue] = useState(""); 
    const [suggestions, setSuggestions] = useState([]);
    const [isLoading, setIsLoading] = useState(false); 

    const toast = useToast();

    // updates scores for a given guess
    const processScoring = (areTeammates, guess) => {
        if (areTeammates) {
            fetch(
                `${API_BASE_URL}/scoring`, 
                {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({ player1_id: data.currPlayerID, player2_id: guess })
                }
            )
                .then(scoreResponse => scoreResponse.json())
                .then(scoreResponse => {
                    const gPlayed = scoreResponse['Weight'];
                    const relevancy = scoreResponse['Relevancy'];

                    const addScore = ((0.7 * gPlayed / 1584) + (0.3 * relevancy / 9.622)) * 25;

                    setScore(Math.ceil(score + addScore));
                    setWrongStreak(0); 
                })
                .catch(error => console.log('Error getting score:', error))
        }

        else {
            setScore(score + 25 + (5 * wrongStreak));
            setWrongStreak(wrongStreak + 1);
        }

    }

    const checkTeammates = async (p1, p2) => {
        return fetch(
            `${API_BASE_URL}/check`,
            {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ player1_id: p1, player2_id: p2})
            }
        )
            .then((response) => response.json())
            .then((response) => {
                console.log(`${p1} and ${p2} are teammates: ${response.areTeammates}`);
                return response.areTeammates; 
            })
            .catch(error => console.log('Error checking teammates:', error))
    }

    const getJson = async (p1) => {
        return fetch(
            `${API_BASE_URL}/player`,
            {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ player_id: p1})
            }
        )
        .then((response) => response.json())
            .then((response) => {
                console.log(`${p1}'s JSON data:  ${response.name}`);
                return {
                    'name' : response.name,
                    'id' : response.id,
                    'url' : response.url
                }; 
            })
            .catch(error => console.log('Error fetching JSON data', error))
    }

    const handleSubmit = (guess) => {

        if (guess) {

            setGuesses(guesses - 1)

            checkTeammates(data.currPlayerID, guess)
                .then((teammates) => {
                    if (teammates) {
                        getJson(guess)
                        .then((jsonData) => {
                            setPlayers(p => [...p, jsonData.name ]);
                            setData({...data, currPlayer : jsonData.name, currPlayerID: jsonData.id});
                            setPics({...pics, currPlayerURL : jsonData.url});
                            console.log(jsonData.name, jsonData.id, jsonData.url);
                            console.log(data.currPlayer, pics.currPlayerURL);
                            checkTeammates(data.lastPlayerID, guess)
                                .then((gameOver) => {
                                    if (gameOver) {
                                        console.log('Game Complete! Well done!');
                                        setPlayers(p => [...p, data.lastPlayer])
                                        modalOpen();
                                    }
                                })
                        })
    
                    }
                
                    processScoring(teammates, guess);
                }); 
        }
        else {
            console.log("User submitted nothing"); 
            toast({
                title: "Please select a player!",
                status: "error", 
                variant: "subtle",
                isClosable: true, 
                duration: 800

            });
        }
    }

    const autocomplete = (inputValue) => {
        setValue(inputValue);

        if (inputValue) {
            setIsLoading(true);

            fetch(`${API_BASE_URL}/autocomplete?search=${inputValue}`)
                .then((response) => response.json())
                .then((data) =>{
                    const results = []

                    for (var key in data) 
                        results.push({label: `${data[key][1]} (${data[key][0]})`, value: key}) //value = key, to index by player_id
                    
                    setSuggestions(results)
                    setIsLoading(false);
                })

        }
    }

    const handleChange = (option, action) => {

        if (action.action === 'select-option') {
            const data_len = players.length; 
            
            console.log(`Guessed ${option.value}`);

            handleSubmit(option.value);

            console.log(`Score: ${score}`);

            if (players.length != data_len)
                setValue('');

        }
    }

    const theme = useTheme();

    const bg = useColorModeValue(theme.colors.white, theme.colors.gray[800])
    const text = useColorModeValue(theme.colors.gray[800], theme.colors.whiteAlpha[900]);
    const border = useColorModeValue(theme.colors.gray[200], theme.colors.whiteAlpha[300])
    const menuBg = useColorModeValue(theme.colors.gray[100], theme.colors.gray[700]);
    const placeholder_color = useColorModeValue(theme.colors.gray[500], theme.colors.whiteAlpha[400])
    const optionBgHover = useColorModeValue(theme.colors.blue[100], theme.colors.blue[700]);

    return (
        <Select
            styles={{
                control: (baseStyles, state) => ({
                    ...baseStyles, 
                    backgroundColor: bg, 
                    borderColor: border,
                    color: text, 
                    '&:hover': {
                        borderColor: optionBgHover,
                    }
                }), 
                menu: (baseStyles, state) => ({
                    ...baseStyles, 
                    backgroundColor: menuBg

                }), 
                option: (baseStyles, state) => ({
                    ...baseStyles, 
                    backgroundColor: state.isFocused ? optionBgHover: menuBg,
                    '&:hover': {
                        backgroundColor: optionBgHover,
                    }
                }), 
                input: (baseStyles, state) => ({
                    ...baseStyles, 
                    color: text

                }), 
                placeholder: (baseStyles, state) => ({
                    ...baseStyles, 
                    color: placeholder_color

                }), 
                dropdownIndicator: (provided) => ({
                    ...provided,
                    color: border,
                    '&:hover': {
                      color: optionBgHover,
                    }
                }),
                indicatorSeparator: (provided) => ({
                    ...provided,
                    backgroundColor: border,
                }),
            }}
            className='search-bar'
            placeholder="Enter a Player's Name..."
            onInputChange={autocomplete}
            isSearchable="true"
            isClearable="true"
            isLoading={isLoading}
            options={suggestions}
            onChange={handleChange}
            closeMenuOnSelect="true"
            value={value}
        />
    )
}

export default GuessForm;