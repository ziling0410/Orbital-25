import React from "react";
import { useNavigate } from "react-router-dom";

function Home() {
	const navigate = useNavigate();
	
	return (
		<div>
			<h1>Welcome to MerchMates</h1>
			<button onClick = {() => navigate("/register")}>Register</button>
			<br />
			<button onClick = {() => navigate("/login")}>Login</button>
		</div>
	);
}

export default Home;