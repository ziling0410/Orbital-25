import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../App";

function Register() {
	const [username, setUsername] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [message, setMessage] = useState("");
	
	const navigate = useNavigate();

	const handleRegister = async () => {
		const { data, error } = await supabase.auth.signUp({
			email,
			password,
		});
		
		if (error) {
			setMessage("Registration failed: " + error.message);
		}
		
		const user = data.user;
		
		if (user) {
			const response = await fetch("/save-username", {
				method: "POST",
				headers: {
					"Content-Type": "application/json", // Tells the server the format of the request's body
				},
				body: JSON.stringify({id: user.id, username: username}) // Actual data to send in the form of a string (convert from JSON to string using stringify())
			});
		
			if (response.ok) {
				setMessage("Registration successful");
				navigate("/login");
			} else {
				const err = await response.text();
				setMessage("Error: " + err);
			}
		}
	};
	
	return (
		<div>
			<h2>Register</h2>
			<input
				type = "text"
				placeholder = "Username" // Short hint describing expected value
				value = {username} // Value of the <input> element 
				onChange = {event => setUsername(event.target.value)} 
				// Update the username happens when a user changes the content of the input field 
				// event - event object React passes when something happens
				// event.target - HTML element that triggered the event (HTMLInputElement)
			/>
			<br />
			<input 
				type = "email"
				placeholder = "Email"
				value = {email}
				onChange = {event => setEmail(event.target.value)}
			/>
			<br />
			<input
				type = "password"
				placeholder = "Password"
				value = {password}
				onChange = {event => setPassword(event.target.value)}
			/>
			<br />
			<button onClick = {handleRegister}>Register</button>
			<br />
			<p>{message}</p>
			<br />
			<button onClick = {() => navigate("/")}>Back to Home</button>
		</div>
	);
}

export default Register;