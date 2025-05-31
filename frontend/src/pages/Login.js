import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../App";

function Login() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [message, setMessage] = useState("");
	
	const navigate = useNavigate();

	const handleLogin = async () => {
		const { error } = await supabase.auth.signInWithPassword({
			email,
			password,
		});
		
		if (error) {
			setMessage("Login failed: " + error.message);
		} else {
			setMessage("Login successful");
			navigate("/get-listings");
		}
	};
	
	return (
		<div>
			<h2>Login</h2>
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
			<button onClick = {handleLogin}>Login</button>
			<br />
			<p>{message}</p>
			<br />
			<button onClick = {() => navigate("/")}>Back to Home</button>
		</div>
	);
}

export default Login;