import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login() {
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [message, setMessage] = useState("");
	
	const navigate = useNavigate();

	const handleLogin = () => {
		fetch("/login", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({username, password})
		})
		.then(data => data.json())
		.then(data => setMessage(data.message))
		.catch(error => setMessage("Error: " + error.message));
	};
	
	return (
		<div>
			<h2>Login</h2>
			<input
				type = "text"
				placeholder = "Username" 
				value = {username} 
				onChange = {event => setUsername(event.target.value)} 
			/>
			<br />
			<input
				type = "password"
				placeholder = "Password"
				value = {password}
				onChange = {event => setPassword(event.target.value)}
			/>
			<br />
			<button onClick = {handleLogin}>Login</button>
			<br />
			<p>{message}</p>
			<br />
			<button onClick = {() => navigate("/")}>Back to Home</button>
		</div>
	);
}

export default Login;