import React, { useEffect, useState } from "react";
import { supabase } from "../App";
import { useNavigate } from "react-router-dom";
import "./AddListings.css";

function AddListings() {
	const [have, setHave] = useState("");
	const [image, setImage] = useState(null);
	const [want, setWant] = useState("");
	const [preferences, setPreferences] = useState("");
	const [userId, setUserId] = useState(null);
	const [userProfile, setUserProfile] = useState(null);
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
		
		const formData = new FormData();
		formData.append("have", have);
		formData.append("haveImage", image);
		formData.append("want", want);
		formData.append("preferences", preferences);
		formData.append("id", userId);
		
		const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/add-listings`, {
			method: "POST",
			body: formData,
		});
		
		if (response.ok) {
			alert("Listing added successfully");
			navigate("/get-listings");
		} else {
			const error = await response.json();
			alert("Error: " + error.message);
		}
	};
	
	const handleLogout = async () => {
		await supabase.auth.signOut();
		navigate("/");
	};

	const handleProfileClick = () => {
		if (!userId) {
			navigate("/login");
		} else {
			navigate(`/profile/${userId}`);
		}
	};

	useEffect(() => {
		const fetchProfile = async () => {
			try {
				const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/get-profile`, {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ id: userId })
				});
				if (response.ok) {
					const profileData = await response.json();
					setUserProfile(profileData);
				} else {
					console.error("Error loading profile");
				}
			} catch (error) {
				console.error("Network error loading profile:", error);
			}
		};

		if (userId) {
			fetchProfile();
		}
	}, [userId]);

	if (!userProfile) {
		return null;
	}
	
	return (
		<div className="addlistings-entire">
			<div className="addlistings-top">
				<div className="addlistings-top-left">
					<h1>Add a Listing</h1>
				</div>
				<div className="addlistings-top-right" onClick={handleProfileClick}>
					<p>{userProfile.username}</p>
					<img src={`${process.env.REACT_APP_BACKEND_URL}${userProfile.image_url}`} alt="Profile" className="profile-pic" />
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
			<button className="add-button" onClick={() => navigate("/get-listings")}>Back to Listings</button>
			<br />
            <br />
			<button className="add-button" onClick = {handleLogout}>Logout</button>
		</div>
	)
}

export default AddListings;