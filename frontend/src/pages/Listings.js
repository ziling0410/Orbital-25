import React, { useEffect, useState } from "react";
import { supabase } from "../App";
import { useNavigate } from "react-router-dom";

function Listings() {
	const [listings, setListings] = useState([]);
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
			<table>
				<thead>
					<tr>
						<th>No.</th>
						<th>Have</th>
						<th>Want</th>
						<th>Preferences</th>
						<th>Username</th>
					</tr>
				</thead>
				<tbody>
					{listings.map((item, index) => (
						<tr key = {index}>
							<td>{index + 1}</td>
							<td>{item.have}</td>
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