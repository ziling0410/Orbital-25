import React, { useEffect, useState, useCallback } from "react";
import { supabase } from "../App";
import { useNavigate } from "react-router-dom";

function TradeHistory() {
	const [userId, setUserId] = useState(null);
	const [userProfile, setUserProfile] = useState(null);
	const [tradeHistory, setTradeHistory] = useState([]);
	const [myIndex, setMyIndex] = useState(0);
	const [otherIndex, setOtherIndex] = useState(0);
	const [searchInput, setSearchInput] = useState("");
	const navigate = useNavigate();

	useEffect(() => {
		const getUser = async () => {
			const { data: { session }, error } = await supabase.auth.getSession();
			if (error) {
				console.error("Error getting session:", error);
				return;
			}
			if (session?.user) {
				setUserId(session.user.id);
				console.log("Set user ID from session:", session.user.id);
			} else {
				console.log("No user session found");
			}
		};
		getUser();
	}, []);


	useEffect(() => {
		const fetchProfile = async () => {
			try {
				console.log("Fetching profile for user ID:", userId);
				const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/get-profile`, {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ id: userId })
				});
				if (response.ok) {
					const profileData = await response.json();
					setUserProfile(profileData);
				} else {
					console.error("Error loading profile");
				}
			} catch (error) {
				console.error("Network error loading profile:", error);
			}
		};

		if (userId) {
			fetchProfile();
		}
	}, [userId]);

	const fetchTradeHistory = useCallback(async () => {
		const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/trade-history?id=${userId}`);
		const data = await response.json();
		setTradeHistory(data);
	}, [userId]);

	useEffect(() => {
		fetchTradeHistory();
	}, [userId, fetchTradeHistory]);

	const displayListings = (listing) => {
		return (
			<div className="listings-card">
				<h3>wtt - {listing.have}</h3>
				<img src={`${process.env.REACT_APP_BACKEND_URL}${listing.image_url}`} alt="Item" />
				<h3>want - {listing.want}</h3>
			</div>
		)
	}

	const handleHomeClick = () => {
		navigate("/");
	};

	const handleProfileClick = () => {
		if (!userId) {
			navigate("/login");
		} else {
			navigate("/profile");
		}
	};

	const handleLogout = async () => {
		await supabase.auth.signOut();
		navigate("/");
	};

	if (!userProfile) {
		return null;
	}

	return (
		<div className="listings-entire">
			<div className="listings-top">
				<div className="listings-top-left" onClick={handleHomeClick}>
					<h1 className="home-brand">MERCHMATES</h1>
				</div>
				<div className="listings-top-right" onClick={handleProfileClick}>
					<p>{userProfile.username}</p>
					<img src={`${process.env.REACT_APP_BACKEND_URL}${userProfile.image_url}`} alt="Profile" className="profile-pic" />
				</div>
			</div>
			<div className="trade-history-center">
				<p>{tradeHistory}</p>
			</div>
			<div className="listings-bottom">
				<button className="function-button" onClick={handleLogout}>Logout</button>
			</div>
		</div>
	);
}

export default TradeHistory;