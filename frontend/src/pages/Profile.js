import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../App";
import { CiMapPin } from "react-icons/ci";
import "./Profile.css";

function Profile() {
	const [userId, setUserId] = useState(null);
	const [userProfile, setUserProfile] = useState(null);
    const [myListings, setMyListings] = useState([]);
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

	useEffect(() => {
		const fetchListing = async () => {
			try {
				const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/get-listings?id=${userId}`);
				if (response.ok) {
					const listingsData = await response.json();
					setMyListings(listingsData);
				} else {
					console.error("Error loading listings");
				}
			} catch (error) {
				console.error("Network error loading listings:", error);
			}
		};

		if (userId) {
            fetchListing();
		}
	}, [userId]);

	const displayListings = (listing) => {
		return (
			<div className="listings-card">
				<h3>wtt - {listing.have}</h3>
				<img src={`http://localhost:3000${listing.image_url}`} alt="Item" />
				<h3>want - {listing.want}</h3>
			</div>
		)
	};

	const handleHomeClick = () => {
		navigate("/");
	};

	const handleLogout = async () => {
		await supabase.auth.signOut();
		navigate("/");
	};

	if (!userProfile) {
		return null;
	}

	return (
		<div className="profile-entire">
			<div className="profile-top">
				<div className="profile-top-left" onClick={handleHomeClick}>
					<h1 className="home-brand">MERCHMATES</h1>
				</div>
				<div className="profile-top-right">
					<p>{userProfile.username}</p>
					<img src={`http://localhost:3000${userProfile.image_url}`} alt="Profile" className="profile-pic" />
				</div>
			</div>
			<div className="profile-center">
				<div className="profile-center-top">
					<div className="profile-center-top-left">
						<img src={`http://localhost:3000${userProfile.image_url}`} alt="Profile" className="profile-img" />
					</div>
					<div className="profile-center-top-right">
						<p>{userProfile.username}</p>
						<p>{userProfile.description}</p>
						<div className="profile-location">
							<CiMapPin />
							<p>{userProfile.location}</p>
						</div>
					</div>
				</div>
				<div className="profile-center-bottom">
					<p>Available for Trade:</p>
					<div className="profile-center-bottom-box">
						<div className="profile-center-bottom-box-item">
							{myListings[0] ? displayListings(myListings[0]) : <p>No listings found.</p>}
						</div>
					</div>
				</div>
			</div>
			<div className="profile-bottom">
				<div className="profile-bottom-right">
					<button className="function-button" onClick={handleLogout}>Logout</button>
				</div>
			</div>
		</div>
	);
}

export default Profile;
