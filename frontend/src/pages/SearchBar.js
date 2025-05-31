import React from "react";
import "./SearchBar.css";

function SearchBar({ searchInput, setSearchInput, onSearch, onClear }) {
	return (
		<div>
			<input
				className="search-input"
				type="text"
				placeholder="Type to search"
				value={searchInput}
				onChange={event => setSearchInput(event.target.value)}
			/>
			<button className="button" onClick={onSearch}>Search</button>
			<button className="button" onClick={onClear}>Clear</button>
		</div>
	)
}

export default SearchBar;