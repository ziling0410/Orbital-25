import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../App";
import "./Login.css";

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
		<div className="login-entire">
			<h1>Login</h1>
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
			<button className="login-button" onClick = {handleLogin}>Login</button>
			<br />
			<p>{message}</p>
			<br />
			<button className="login-button" onClick = {() => navigate("/")}>Back to Home</button>
		</div>
	);
}

export default Login;