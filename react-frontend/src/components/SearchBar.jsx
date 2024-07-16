import { useState } from "react";

const SearchBar = ({search, setSearchBar, results, setResults, index, setIndex}) => {

    const handleChange = (e) => {
        setSearchBar(e.target.value);

        fetch(`http://localhost:5000/autocomplete?search=${e.target.value}`)
            .then((response) => response.json())
            .then((data) =>{
                const suggestions = []
                for (var key in data) {
                    suggestions.push({'id': key, 'name': data[key][1], 'year': data[key][0]})
                }
                setResults(suggestions)
            })
        
    }

    const handleKeyDown = (e) => {
        if (results.length != 0) {
            if (e.key === "ArrowDown") {
                if (index >= results.length - 1)
                    setIndex(0)
                else
                    setIndex(index + 1)

                setSearchBar(results[index].name)
            }
            if (e.key === "ArrowUp") {
                if (index <= 0)
                    setIndex(results.length - 1)
                else
                    setIndex(index - 1)

                setSearchBar(results[index].name)
            }
        }

    }

    return (
        <div className="SearchBar">
            <input type="text" placeholder="Enter a Player..."
            value = {search} 
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            />
            <div className="Dropdown">
                <ul>
                    {results.map((result, index) =>
                        <li key={result.id} onClick={() => {setSearchBar(result.name); setIndex(index)}}>
                            {`${result.name} (${result.year})`}
                        </li>
                    )}
                </ul>
            </div>
        </div>
    )
}

export default SearchBar