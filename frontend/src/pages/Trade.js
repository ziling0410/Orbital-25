
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../App";
import React, { useEffect, useState } from "react";
import "./Trade.css";

function Trade() {
	const { tradeId } = useParams();
	const [trade, setTrade] = useState(null);
	const [userId, setUserId] = useState(null);
	const [userProfile, setUserProfile] = useState(null);
	const navigate = useNavigate();

	useEffect(() => {
		const getUser = async () => {
			const { data: { user } } = await supabase.auth.getUser();
			if (user) {
				setUserId(user.id);
			}
		};
		getUser();
	}, []);

	useEffect(() => {
		const fetchProfile = async () => {
			try {
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

	const handleHomeClick = () => {
		navigate("/");
	};

	const fetchTrade = async () => {
		try {
			const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/trade/${tradeId}`);
			if (response.ok) {
				const data = await response.json();
				setTrade(data);
			} else {
				console.log("Failed to fetch trade");
			}
		} catch (error) {
			console.log("Error fetching trade: ", error);
		}
	};

	useEffect(() => {
		if (userId && tradeId) {
			fetchTrade();
		}
	}, [userId, tradeId]);

	const updateStatus = async (user_id, status) => {
		try {
			const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/update-trade-status`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ tradeId, user_id, status }),
			});
			if (response.ok) {
				const data = await response.json();
				fetchTrade();
			} else {
				console.log("Failed to update trade status");
			}
		} catch (error) {
			console.log("Error updating trade status: ", error);
		}
	};

	const rejectTrade = async () => {
		try {
			const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/reject-trade`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ tradeId }),
			});
			if (response.ok) {
				navigate("/get-listings");
			} else {
				console.log("Failed to delete trade");
			}
		} catch (error) {
			console.log("Error deleting trade: ", error);
		}
	};

	const leaveReview = async (tradeId) => {
		try {
			navigate(`/review/${tradeId}`);
		} catch (error) {
			console.log("Error navigating to leave review: ", error);
		}
	};

	if (!userProfile || !trade) {
		return null;
	}

	return (
		<div className="trade-entire">
			<div className="trade-top">
				<div className="trade-top-left" onClick={handleHomeClick}>
					<h1 className="home-brand">MERCHMATES</h1>
				</div>
				<div className="trade-top-right">
					<p>{userProfile.username}</p>
					<img src={`${process.env.REACT_APP_BACKEND_URL}${userProfile.image_url}`} alt="Profile" className="profile-pic" />
				</div>
			</div>
			<div className="trade-center">
				<div className="trade-center-left">
					<div className="trade-center-left-box">
						{userId === trade["userA_id"] ? (
							<div>
								<p><strong>Your Item - </strong>{trade["userA_have"]}</p>
								<br />
								<p><strong>Your Status - </strong>{trade["userA_status"]}</p>
							</div>
						) : userId === trade["userB_id"] ? (
							<div>
								<p><strong>Your Item - </strong>{trade["userB_have"]}</p>
								<br />
								<p><strong>Your Status - </strong>{trade["userB_status"]}</p>
							</div>
						) : null}
					</div>
				</div>
				<div className="trade-center-right">
					<div className="trade-center-right-box">
						{userId === trade["userA_id"] ? (
							<div>
								<p><strong>Their Item - </strong>{trade["userB_have"]}</p>
								<br />
								<p><strong>Their Status - </strong>{trade["userB_status"]}</p>
							</div>
						) : userId === trade["userB_id"] ? (
							<div>
								<p><strong>Their Item - </strong>{trade["userA_have"]}</p>
								<br />
								<p><strong>Their Status - </strong>{trade["userA_status"]}</p>
							</div>
						) : null}
					</div>
				</div>
			</div>
			<div className="trade-bottom">
				<div className="trade-bottom-left">
                    <button className="trade-home-button" onClick={fetchTrade}>Refresh Trade</button>
				</div>
				<div className="trade-bottom-center">
					{trade[`user${userId === trade["userA_id"] ? "A" : "B"}_status`] === "Pending" && (
						<div className="trade-buttons">
							<button className="trade-button" onClick={() => updateStatus(userId, "Agreed")}>Accept Trade</button>
							<button className="trade-button" onClick={rejectTrade}>Reject Trade</button>
						</div>
					)}
					{trade[`user${userId === trade["userA_id"] ? "A" : "B"}_status`] === "Agreed" && (
						<div className="trade-buttons">
							<button className="trade-button" onClick={() => updateStatus(userId, "Shipped")}>Confirm Shipping</button>
						</div>
					)}
					{trade[`user${userId === trade["userA_id"] ? "A" : "B"}_status`] === "Shipped" && (
						<div className="trade-buttons">
							<button className="trade-button" onClick={() => updateStatus(userId, "Completed")}>Confirm Received</button>
						</div>
                    )}
					{trade[`user${userId === trade["userA_id"] ? "A" : "B"}_status`] === "Completed" && (
						<div className="trade-buttons">
							<button className="trade-button" onClick={() => leaveReview(tradeId)}>Leave a Review</button>
						</div>
					)}
				</div>
				<div className="trade-bottom-right">
					<button className="trade-home-button" onClick={() => navigate("/get-listings")}>Back to Listings</button>
				</div>
			</div>
		</div>
	);
}

export default Trade;