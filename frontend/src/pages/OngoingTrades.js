import React, { useEffect, useState, useCallback } from "react";
import { supabase } from "../App";
import { useNavigate } from "react-router-dom";

function OngoingTrades({userId: propUserId}) {
	const [userId, setUserId] = useState(propUserId);
	const [userProfile, setUserProfile] = useState(null);
	const [ongoingTrades, setOngoingTrades] = useState([]);
	const navigate = useNavigate();

	useEffect(() => {
		if (propUserId) {
			setUserId(propUserId);
		}
	}, [propUserId]);

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

	const fetchOngoingTrades = useCallback(async () => {
		const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/get-ongoing-trades?id=${userId}`);
		const data = await response.json();
		setOngoingTrades(data);
	}, [userId]);

	useEffect(() => {
		fetchOngoingTrades();
	}, [userId, fetchOngoingTrades]);

	const handleHomeClick = () => {
		navigate("/");
	};

	const handleProfileClick = () => {
		if (!userId) {
			navigate("/login");
		} else {
			navigate(`/profile/${userId}`);
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
		<div className="trade-history-entire">
			<div className="trade-history-top">
				<div className="trade-history-top-left" onClick={handleHomeClick}>
					<h1 className="home-brand">MERCHMATES</h1>
				</div>
				<div className="trade-history-top-right" onClick={handleProfileClick}>
					<p>{userProfile.username}</p>
					<img src={`${process.env.REACT_APP_BACKEND_URL}${userProfile.image_url}`} alt="Profile" className="profile-pic" />
				</div>
			</div>
			<div className="trade-history-center">
				{ongoingTrades.length === 0 ? (
					<p>No ongoing trades.</p>
				) : (
					<table className="trade-history-table">
						<thead>
							<tr>
								<th className="trade-history-col-user">User</th>
								<th className="trade-history-col-item">Your Item</th>
								<th className="trade-history-col-item">Their Item</th>
								<th className="trade-history-col-time">Time</th>
							</tr>
						</thead>
						<tbody>
							{ongoingTrades.map((trade) => (
								<tr key={trade._id}>
									<td className="trade-history-col-user" onClick={() => navigate(`/profile/${trade.user_id}`)}>{trade.other_user}</td>
									<td className="trade-history-col-item" onClick={() => navigate(`/trade/${trade._id}`)}>{trade.own_item}</td>
									<td className="trade-history-col-item" onClick={() => navigate(`/trade/${trade._id}`)}>{trade.other_item}</td>
									<td className="trade-history-col-time" onClick={() => navigate(`/trade/${trade._id}`)}>{new Date(trade.created_at).toLocaleString()}</td>
								</tr>
							))}
						</tbody>
					</table>
				)}
			</div>
			<div className="trade-history-bottom">
				<button className="function-button" onClick={handleLogout}>Logout</button>
			</div>
		</div>
	);
}

export default OngoingTrades;