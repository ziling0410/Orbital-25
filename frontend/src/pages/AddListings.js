import React, { useEffect, useState } from "react";
import { supabase } from "../App";
import { useNavigate } from "react-router-dom";
import "./AddListings.css";

function AddListings() {
	const [have, setHave] = useState("");
	const [image, setImage] = useState(null);
	const [want, setWant] = useState("");
	const [preferences, setPreferences] = useState("");
	const [message, setMessage] = useState("");
	const [userId, setUserId] = useState(null);
	const [username, setUsername] = useState("");
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
		
		const formData = new FormData();
		formData.append("have", have);
		formData.append("haveImage", image);
		formData.append("want", want);
		formData.append("preferences", preferences);
		formData.append("id", userId);
		
		const response = await fetch("/add-listings", {
			method: "POST",
			body: formData,
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
	
	return (
		<div className="entire">
			<div className="top">
				<div className="top-left">
					<h1>Add a Listing</h1>
				</div>
				<div className="top-right">
					<p>{username}</p>
				</div>
			</div>
			<input
                className="input"
				type = "text"
				placeholder = "What you have"
				value = {have} 
				onChange = {event => setHave(event.target.value)} 
			/>
			<br />
			<input
                className="input"
				type = "file"
				placeholder = "What you have (image)"
				onChange = {event => setImage(event.target.files[0])}
			/>
			<br />
			<input 
                className="input"
				type = "text"
				placeholder = "What you want"
				value = {want}
				onChange = {event => setWant(event.target.value)}
			/>	
			<br />
			<input
				className="input"
				type = "text"
				placeholder = "Preferences (put NA if nothing)"
				value = {preferences}
				onChange = {event => setPreferences(event.target.value)}
			/>
			<br />
			<button className="add-button" onClick = {event => {
				event.preventDefault();
				handleListing();
			}}>Add</button>
			<br />
			<p>{message}</p>
			<br />
			<button className="add-button" onClick={() => navigate("/get-listings")}>Back to Listings</button>
			<br />
            <br />
			<button className="add-button" onClick = {handleLogout}>Logout</button>
		</div>
	)
}

export default AddListings;