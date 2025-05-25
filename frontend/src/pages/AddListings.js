import React, { useEffect, useState } from "react";
import { supabase } from "../App";
import { useNavigate } from "react-router-dom";

function AddListings() {
	const [have, setHave] = useState("");
	const [want, setWant] = useState("");
	const [preferences, setPreferences] = useState("");
	const [message, setMessage] = useState("");
	const [userId, setUserId] = useState(null);
	const navigate = useNavigate();
	
	useEffect(() => {
		const getUser = async () => {
			const { data: { user } } = await supabase.auth.getUser();
			if (user) {
				setUserId(user.id);
			}
		};
		getUser();
	}, []);
	
	const handleListing = async () => {
		if (!userId) {
			setMessage("Error: User not found, please login first");
		}
		
		const response = await fetch("/add-listings", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({have: have, want: want, preferences: preferences, id: userId})
		});
		
		if (response.ok) {
			setMessage("Listing added successfully");
			navigate("/get-listings");
		} else {
			const error = await response.json();
			setMessage("Error: " + error.message);
		}
	};
	
	const handleLogout = async () => {
		await supabase.auth.signOut();
		navigate("/");
	};
	
	return (
		<div>
			<h2>Add a Listing</h2>
			<input
				type = "text"
				placeholder = "What you have"
				value = {have} 
				onChange = {event => setHave(event.target.value)} 
			/>
			<br />
			<input 
				type = "text"
				placeholder = "What you want"
				value = {want}
				onChange = {event => setWant(event.target.value)}
			/>
			<br />
			<input
				type = "text"
				placeholder = "Preferences (put NA if nothing)"
				value = {preferences}
				onChange = {event => setPreferences(event.target.value)}
			/>
			<br />
			<button onClick = {handleListing}>Add</button>
			<br />
			<p>{message}</p>
			<br />
			<button onClick = {handleLogout}>Logout</button>
		</div>
	)
}

export default AddListings;