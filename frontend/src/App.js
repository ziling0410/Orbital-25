import "./App.css";
import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Listings from "./pages/Listings";
import AddListings from "./pages/AddListings";
import Profile from "./pages/Profile";
import Trade from "./pages/Trade";
import NotificationPollerWrapper from "./pages/NotificationPollerWrapper";
import Notifications from "./pages/Notifications.js";
import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
	"https://urgdblbvanfbqgthvzgy.supabase.co",
	"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVyZ2RibGJ2YW5mYnFndGh2emd5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgwNjEwMjUsImV4cCI6MjA2MzYzNzAyNX0.UpwRG_6XMueuMaBuYutEy_3wsOsA0o6zACJ5x03mrrI"
);

function App() {
	const [session, setSession] = useState(null);
	const [userId, setUserId] = useState(null);
	
	useEffect(() => {
		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange((_event, session) => {
			console.log("Auth state changed, session:", session);
			setSession(session);
			setUserId(session?.user?.id ?? null);
		});

		supabase.auth.getSession().then(({ data: { session } }) => {
			setSession(session);
			setUserId(session?.user?.id ?? null);
			if (session) {
				console.log("Valid session on app load:", session.user.id);
			}
		});

		return () => subscription.unsubscribe();
	}, []);
		
	return (
		<div className = "App">
			<BrowserRouter>
				<NotificationPollerWrapper userId={userId} />
				<Routes>
					<Route path = "/" element = {<Home />} />
					<Route path = "/login" element = {session ? <Navigate to = "/" /> : <Login />} />
					<Route path = "/register" element = {session ? <Navigate to = "/" /> : <Register />} />
					<Route path = "/get-listings" element = {session ? <Listings user = {session.user} /> : <Navigate to = "/login" />} />
					<Route path = "/add-listings" element = {session ? <AddListings user = {session.user} /> : <Navigate to = "/login" />} />
					<Route path = "/profile" element = {session ? <Profile user = {session.user} /> : <Navigate to = "/login" />} />
					<Route path="/trade/:tradeId" element={session ? <Trade user={session.user} /> : <Navigate to="/login" />} />
                    <Route path="/notifications" element={session ? <Notifications userId={userId} /> : <Navigate to="/login" />} />
				</Routes>
			</BrowserRouter>
			<ToastContainer position="top-right" autoClose={5000} />
		</div>
	);
}

export default App;
