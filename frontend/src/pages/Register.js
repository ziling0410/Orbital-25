import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { supabase } from "../App";
import "./Register.css";

function Register() {
	const [username, setUsername] = useState("");
	const [image, setImage] = useState(null);
	const [description, setDescription] = useState("");
    const [location, setLocation] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	
	const navigate = useNavigate();

	const handleRegister = async () => {
		await supabase.auth.signOut();

		const { data, error } = await supabase.auth.signUp({
			email,
			password,
		});

		if (error) {
			toast.error("Registration failed: " + error.message);
			return;
		}

		const user = data.user;

		if (!user) {
			toast.error("User creation failed — no user returned.");
			return;
		}

		const formData = new FormData();
		formData.append("username", username);
		formData.append("profilePicture", image);
		formData.append("id", user.id);
		formData.append("description", description);
		formData.append("location", location);

		try {
			const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/save-username`, {
				method: "POST",
				body: formData,
			});

			if (response.ok) {
				toast.success("Registration successful! Please check your mailbox for the confirmation email. If the link doesn't direct you back to this page, please come back to this page and refresh it to login.");
				navigate("/");
			} else {
				const err = await response.text();
				toast.error("Error saving username: " + err);
			}
		} catch (err) {
			toast.error("Network error saving profile: " + err.message);
		}
	};
		
	return (
		<div className="register-entire">
			<h1>Register</h1>
			<input
                className="input"
				type = "text"
				placeholder="Username"
                value={username}
				onChange = {event => setUsername(event.target.value)} 
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
			<button className="register-button" onClick = {() => navigate("/")}>Back to Home</button>
		</div>
	);
}

export default Register;
