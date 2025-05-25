import React, { useEffect, useState } from "react";
import { supabase } from "../App";
import { useNavigate } from "react-router-dom";

function Listings() {
	const [listings, setListings] = useState([]);
	const [searchInput, setSearchInput] = useState("");
	const [searchResults, setSearchResults] = useState([]);
	const [hasSearched, setHasSearched] = useState(false);
	const navigate = useNavigate();
	
	useEffect(() => {
		fetch("http://localhost:3000/get-listings")
			.then((data) => data.json())
			.then((data) => setListings(data))
			.catch((error) => console.log("Error fetching listings: ", error));
	}, []);
	
	const handleLogout = async () => {
		await supabase.auth.signOut();
		navigate("/");
	};

	const searchBar = async () => {
		setHasSearched(true);
		const response = await fetch(`/search-listings?keyword=${encodeURIComponent(searchInput)}`);
		
		if (response.ok) {
			const data = await response.json();
			setSearchResults(data);
		}
	};
	
	return (
		<div>
			<h1>List of Trades</h1>
			<br />
			<input 
				type = "text"
				placeholder = "Type to search"
				value = {searchInput}
				onChange = {event => setSearchInput(event.target.value)} 
			/>
			<br />
			<button onClick = {searchBar}>Search</button>
			<br />
			<button onClick = {() => {
				setSearchResults([]);
				setSearchInput("");
				setHasSearched(false);
			}}>Clear Search</button>
			<br />
			<table>
				<thead>
					<tr>
						<th>No.</th>
						<th>Have</th>
						<th>Image</th>
						<th>Want</th>
						<th>Preferences</th>
						<th>Username</th>
					</tr>
				</thead>
				<tbody>
					{(hasSearched ? searchResults : listings).map((item, index) => (
						<tr key = {index}>
							<td>{index + 1}</td>
							<td>{item.have}</td>
							<td>{<img src = {`http://localhost:3000${item.image_url}`} alt = "Item" width = "200" />}</td>
							<td>{item.want}</td>
							<td>{item.preferences}</td>
							<td>{item.username}</td>
						</tr>
					))}
				</tbody>
			</table>
			<br />
			<button onClick = {() => navigate("/add-listings")}>Add a Listing</button>
			<br />
			<button onClick = {handleLogout}>Logout</button>
		</div>
	)
}

export default Listings;