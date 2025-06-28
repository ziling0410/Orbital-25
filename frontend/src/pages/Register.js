import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../App";
import "./Register.css";

function Register() {
	const [username, setUsername] = useState("");
	const [image, setImage] = useState(null);
	const [description, setDescription] = useState("");
    const [location, setLocation] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [message, setMessage] = useState("");
	
	const navigate = useNavigate();

	const handleRegister = async () => {
		const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
			email,
			password,
		});

		if (signUpError) {
			setMessage("Registration failed: " + signUpError.message);
			return;
		}

		const { error: signInError } = await supabase.auth.signInWithPassword({
			email,
			password,
		});

		if (signInError) {
			setMessage("Login after signup failed: " + signInError.message);
			return;
		}

		const { data: userData } = await supabase.auth.getUser();
		const user = userData?.user;

		if (user && user.id) {
			const formData = new FormData();
			formData.append("username", username);
			formData.append("profilePicture", image);
			formData.append("id", user.id);
			formData.append("description", description);
			formData.append("location", location);

			const response = await fetch("/save-username", {
				method: "POST",
				body: formData,
			});

			if (response.ok) {
				setMessage("Registration successful!");
				navigate("/");
			} else {
				const err = await response.text();
				setMessage("Error saving username: " + err);
			}
		} else {
			setMessage("User ID not found after login.");
		}
	};

		
	return (
		<div className="register-entire">
			<h1>Register</h1>
			<input
                className="input"
				type = "text"
				placeholder="Username" // Short hint describing expected value
                value={username} // value of the input field is set to the username state variable
				onChange = {event => setUsername(event.target.value)} 
				// Update the username happens when a user changes the content of the input field 
				// event - event object React passes when something happens
				// event.target - HTML element that triggered the event (HTMLInputElement)
			/>
			<br />
			<input
				className="input"
				type="file"
				placeholder="Profile Picture"
				onChange={event => setImage(event.target.files[0])}
			/>
			<br />
			<input
				className="input"
				type="text"
				placeholder="Description"
                value={description}
				onChange={event => setDescription(event.target.value)}
			/>
			<br />
			<input
				className="input"
				type="text"
				placeholder="Location"
                value={location}
				onChange={event => setLocation(event.target.value)}
			/>
			<br />
			<input 
                className="input"
				type = "email"
				placeholder = "Email"
				value = {email}
				onChange = {event => setEmail(event.target.value)}
			/>
			<br />
			<input
                className="input"
				type = "password"
				placeholder = "Password"
				value = {password}
				onChange = {event => setPassword(event.target.value)}
			/>
			<br />
			<button className="register-button" onClick = {handleRegister}>Register</button>
			<br />
			<p>{message}</p>
			<br />
			<button className="register-button" onClick = {() => navigate("/")}>Back to Home</button>
		</div>
	);
}

export default Register;