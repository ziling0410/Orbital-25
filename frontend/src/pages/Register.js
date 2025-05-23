import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function Register() {
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [message, setMessage] = useState("");
	
	const navigate = useNavigate();

	const handleRegister = () => {
		fetch("/register", {
			method: "POST",
			headers: {
				"Content-Type": "application/json", // Tells the server the format of the request's body
			},
			body: JSON.stringify({username, password}) // Actual data to send in the form of a string (convert from JSON to string using stringify())
		})
		.then(data => data.json())
		.then(data => setMessage(data.message))
		.catch(error => setMessage("Error: " + error.message));
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