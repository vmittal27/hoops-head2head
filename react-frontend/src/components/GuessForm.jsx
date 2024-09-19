import React, { useState} from 'react'
import {useToast, useColorModeValue} from '@chakra-ui/react'
import { useTheme } from '@chakra-ui/system'
import Select from "react-select"
import '../css/SinglePlayer.css'

const GuessForm = ({guesses, setGuesses, players, setPlayers, data, setData, modalOpen, score, setScore, pics, setPics, gameMode, setRoundPath, setRoundGuessesUsed}) => {

    // states for search bar
    const [value, setValue] = useState(""); 
    const [suggestions, setSuggestions] = useState([]);
    const [isLoading, setIsLoading] = useState(false); 

    const toast = useToast();

    // updates scores for a given guess
    const processScoring = (areTeammates, guess, over) => {
        if (areTeammates) {
            fetch(
                `/scoring`, 
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

                    const addScore = (((0.7 * (1584 - gPlayed)/ 1584) + (0.3 * (9.622 - relevancy) / 9.622)) * 100)/(6-guesses)**(1.5);

                    setScore(Math.ceil(score + addScore  + 70 * guesses * over));
                })
                .catch(error => console.log('Error getting score:', error))
        } else{
            setScore(score); 
        }


    }

    const checkTeammates = async (p1, p2) => {
        return fetch(
            `/check`,
            {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ player1_id: p1, player2_id: p2})
            }
        )
            .then((response) => response.json())
            .then((response) => {
                if(response.areTeammates){
                    return 1;
                }
                return 0;
            })
            .catch(error => console.log('Error checking teammates:', error))
    }

    const getJson = async (p1) => {
        return fetch(
            `/player`,
            {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ player_id: p1})
            }
        )
        .then((response) => response.json())
            .then((response) => {
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
            if (gameMode == 'multi')
                setRoundGuessesUsed(6 - guesses)
            setGuesses(guesses - 1)

            checkTeammates(data.currPlayerID, guess)
                .then((teammates) => {
                    if (teammates) {
                        getJson(guess)
                        .then((jsonData) => {
                            setPlayers(p => [...p, jsonData.name ]);
                            setData({...data, currPlayer : jsonData.name, currPlayerID: jsonData.id});
                            setRoundPath((prev) => [...prev, jsonData.id])
                            setPics({...pics, currPlayerURL: jsonData.url});
                            checkTeammates(data.lastPlayerID, guess)
                                .then((gameOver) => {
                                    if (gameOver) {
                                        setPlayers(p => [...p, data.lastPlayer]);
                                        setRoundPath((prev) => [...prev, data.lastPlayerID])
                                        modalOpen();
                                        if (gameMode == 'single')
                                            processScoring(teammates, guess, gameOver)
                                    }
                                
                                })
                        })
                        
                    }
                
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

            fetch(`/autocomplete?search=${inputValue}`)
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

            handleSubmit(option.value);

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
                container: (baseStyles, state) => ({
                    ...baseStyles, 
                    width: '20em'
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