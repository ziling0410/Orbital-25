import "./App.css";
import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Listings from "./pages/Listings";
import AddListings from "./pages/AddListings";
import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
	"https://urgdblbvanfbqgthvzgy.supabase.co",
	"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVyZ2RibGJ2YW5mYnFndGh2emd5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgwNjEwMjUsImV4cCI6MjA2MzYzNzAyNX0.UpwRG_6XMueuMaBuYutEy_3wsOsA0o6zACJ5x03mrrI"
);

function App() {
	const [session, setSession] = useState(null);
	
	useEffect(() => {
		supabase.auth.getSession()
			.then(({ data: { session } }) => {
				setSession(session);
			});
		
		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange((_event, session) => {
			setSession(session);
		});
		
		return () => subscription.unsubscribe();
	}, []);
	
	return (
		<div className = "App">
			<BrowserRouter>
				<Routes>
					<Route path = "/" element = {<Home />} />
					<Route path = "/login" element = {session ? <Navigate to = "/get-listings" /> : <Login />} />
					<Route path = "/register" element = {session ? <Navigate to = "/get-listings" /> : <Register />} />
					<Route path = "/get-listings" element = {session ? <Listings user = {session.user} /> : <Navigate to = "/login" />} />
					<Route path = "/add-listings" element = {session ? <AddListings user = {session.user} /> : <Navigate to = "/login" />} />
				</Routes>
			</BrowserRouter>
		</div>
	);
}

export default App;
