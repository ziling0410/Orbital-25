import "./App.css";
import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import '@fortawesome/fontawesome-free/css/all.min.css';
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Listings from "./pages/Listings";
import AddListings from "./pages/AddListings";
import Profile from "./pages/Profile";
import Trade from "./pages/Trade";
import TradeHistory from "./pages/TradeHistory";
import NotificationPollerWrapper from "./pages/NotificationPollerWrapper";
import Notifications from "./pages/Notifications.js";
import Review from "./pages/Review.js";
import ChatWidget from "./pages/Chat.js";
import OngoingTrades from "./pages/OngoingTrades.js";
import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
	process.env.REACT_APP_SUPABASE_URL,
	process.env.REACT_APP_SUPABASE_ANON_KEY
);

function App() {
	const [session, setSession] = useState(null);
	const [userId, setUserId] = useState(null);
	
	useEffect(() => {
		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange((_event, session) => {
			setSession(session);
			setUserId(session?.user?.id ?? null);
		});

		supabase.auth.getSession().then(({ data: { session } }) => {
			setSession(session);
			setUserId(session?.user?.id ?? null);
		});

		return () => subscription.unsubscribe();
	}, []);
		
	return (
		<div className = "App">
			<BrowserRouter>
				<NotificationPollerWrapper userId={userId} />
				<Routes>
					<Route path="/" element={<Home userId={userId} />} />
					<Route path = "/login" element = {<Login />} />
					<Route path = "/register" element = {<Register />} />
					<Route path = "/get-listings" element = {session ? <Listings userId = {userId} /> : <Navigate to = "/login" />} />
					<Route path = "/add-listings" element = {session ? <AddListings userId = {userId} /> : <Navigate to = "/login" />} />
					<Route path = "/profile/:userId" element = {session ? <Profile /> : <Navigate to = "/login" />} />
					<Route path = "/trade/:tradeId" element = {session ? <Trade userId = {userId} /> : <Navigate to="/login" />} />
					<Route path = "/notifications" element = {session ? <Notifications userId = {userId} /> : <Navigate to="/login" />} />
					<Route path = "/ongoing-trades" element = {session ? <OngoingTrades userId = {userId} /> : <Navigate to="/login" />} />
                    <Route path = "/trade-history" element = {session ? <TradeHistory userId = {userId} /> : <Navigate to="/login" />} />
					<Route path = "/review/:tradeId" element = {session ? <Review userId = {userId} /> : <Navigate to="/login" />} />
					<Route path = "/chat" element = {session ? (<ChatWidget storageKey = {`chat_${userId}`} users = {[ { id: userId, label: "You" }, { id: "support", label: "Support" } ]} />) : (<Navigate to="/login" />) } />
				</Routes>
			</BrowserRouter>
			<ToastContainer position="top-right" autoClose={5000} />
		</div>
	);
}

export default App;
