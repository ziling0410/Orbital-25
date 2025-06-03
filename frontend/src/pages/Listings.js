import React, { useEffect, useState } from "react";
import { supabase } from "../App";
import { useNavigate } from "react-router-dom";
import SearchBar from "./SearchBar";
import "./Listings.css";

function Listings() {
	const [userId, setUserId] = useState(null);
	const [username, setUsername] = useState("");
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

	useEffect(() => {
		const getUser = async () => {
			const { data: { user } } = await supabase.auth.getUser();
			if (user) {
				setUserId(user.id);
			}
		};
		getUser();
	}, []);

	useEffect(() => {
		const fetchUsername = async () => {
			try {
				const response = await fetch("http://localhost:3000/get-username", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({ id: userId }),
				});

				if (response.ok) {
					const data = await response.json();
					setUsername(data.username);
				} else {
					console.log("Failed to fetch username");
				}
			} catch (error) {
				console.log("Error fetching username: ", error);
			}
		};

		if (userId) {
			fetchUsername();
		}
	}, [userId]);
	

	const handleLogout = async () => {
		await supabase.auth.signOut();
		navigate("/");
	};

	const handleSearch = async () => {
		setHasSearched(true);
		const response = await fetch(`/search-listings?keyword=${encodeURIComponent(searchInput)}`);

		if (response.ok) {
			const data = await response.json();
			setSearchResults(data);
		}
	};

	const handleClearSearch = async () => {
		setSearchResults([]);
		setSearchInput("");
        setHasSearched(false);
	}
	
	return (
		<div className="entire">
			<div className="top">
                <div className="top-center">
					<SearchBar
						searchInput={searchInput}
						setSearchInput={setSearchInput}
						handleSearch={handleSearch}
						handleClearSearch={handleClearSearch}
					/>
				</div>
				<div className="top-right">
					<p>{username}</p>
				</div>
			</div>
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
			<button className="button" onClick = {() => navigate("/add-listings")}>Add a Listing</button>
			<br />
			<br />
			<button className="button" onClick = {handleLogout}>Logout</button>
		</div>
	)
}

export default Listings;