import React, { useEffect, useState } from "react";
import { supabase } from "../App";
import { useNavigate } from "react-router-dom";

function Listings() {
	const [listings, setListings] = useState([])
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
	
	return (
		<div>
			<h1>List of Trades</h1>
			<br />
			<ul>
				{listings.map((item, index) => (
					<li key = {index}>
						{JSON.stringify(item)}
					</li>
				))}
			</ul>
			<br />
			<button onClick = {handleLogout}>Logout</button>
		</div>
	)
}

export default Listings;