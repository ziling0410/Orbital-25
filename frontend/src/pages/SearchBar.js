import React from "react";
import "./SearchBar.css";

function SearchBar({ searchInput, setSearchInput, handleSearch, handleClearSearch }) {

	return (
		<div>
			<input
				className="search-input"
				type="text"
				placeholder="Type to search"
				value={searchInput}
				onChange={event => setSearchInput(event.target.value)}
				onKeyDown={event => {
					if (event.key === "Enter") {
						handleSearch();
					}
				}}
			/>
			<button className="button" onClick={handleClearSearch}>Clear Search Results</button>
		</div>
	)
}

export default SearchBar;