import { useState, useEffect} from "react";
import Select from "react-select"

const SearchBar = ({guess, setGuess, onKeyDown}) => {

    const [suggestions, setSuggestions] = useState([])
    const [isLoading, setIsLoading] = useState(false); 

    const handleInput = (inputValue) => {
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

                setIsLoading(false)
        }
    }

    const HandleKeyDown = (e) => {
        if (!guess &&  suggestions.length > 0 && e.key === "Enter") {
            setGuess(suggestions[0].value);
        }
        onKeyDown(e);
    }

    const handleChange = (option) => {
        if (option) {
            console.log("value", option.value)
            setGuess(option.value)
        }
        if (!guess &&  suggestions.length > 0) {
            setGuess(suggestions[0].value);
        }
        onKeyDown();

    }

    return (
        <Select
            placeholder="Enter a Player's Name..."
            onChange={handleChange}
            isLoading={isLoading}
            isSearchable="true"
            isClearable="true"
            options={suggestions}
            onInputChange={handleInput}
            // onKeyDown={HandleKeyDown}
            // value={guess}
        />
    )
}


export default SearchBar