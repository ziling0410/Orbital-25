import React, { useEffect, useState, useCallback } from "react";
import { supabase } from "../App";
import { useNavigate } from "react-router-dom";
import { FaHeart } from "react-icons/fa";
import SearchBar from "./SearchBar";
import "./Listings.css";

function Listings() {
	const [userId, setUserId] = useState(null);
	const [userProfile, setUserProfile] = useState(null);
	const [myListings, setMyListings] = useState([]);
	const [otherListings, setOtherListings] = useState([]);
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

	const fetchListings = useCallback(async () => {
		const responseOthers = await fetch(`${process.env.REACT_APP_BACKEND_URL}/get-listings?excludeId=${userId}`);
		const responseSelf = await fetch(`${process.env.REACT_APP_BACKEND_URL}/get-listings?id=${userId}`);
		const dataOthers = await responseOthers.json();
		const dataSelf = await responseSelf.json();
		setMyListings(dataSelf);
		setOtherListings(dataOthers);
	}, [userId]);

	useEffect(() => {
		fetchListings();
	}, [userId, fetchListings]);
	
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

	const handleSearch = async () => {
		const searchResponseOthers = await fetch(`${process.env.REACT_APP_BACKEND_URL}/search-listings?keyword=${encodeURIComponent(searchInput)}&excludeId=${userId}`);
		const searchResponseSelf = await fetch(`${process.env.REACT_APP_BACKEND_URL}/search-listings?keyword=${encodeURIComponent(searchInput)}&id=${userId}`);
		const searchDataOthers = await searchResponseOthers.json();
		const searchDataSelf = await searchResponseSelf.json();
		setOtherListings(searchDataOthers);
		setMyListings(searchDataSelf);
	};

	const handleClearSearch = () => {
		fetchListings();
		setSearchInput("");
	};

	const handleLike = async () => {
		const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/start-trade`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ userId, listingId: otherListings[otherIndex]._id }),
		});

		const data = await response.json();

		if (response.ok) {
            navigate(`/trade/${data.trade_id}`);
		} else {
			console.error("Error liking listing: ", data.message);
		}
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
				<div className="listings-top-center">
					<SearchBar
						searchInput={searchInput}
						setSearchInput={setSearchInput}
						handleSearch={handleSearch}
						handleClearSearch={handleClearSearch}
					/>
				</div>
				<div className="listings-top-right" onClick={handleProfileClick}>
					<p>{userProfile.username}</p>
					<img src={`${process.env.REACT_APP_BACKEND_URL}${userProfile.image_url}`} alt="Profile" className="profile-pic" />
				</div>
			</div>
			<div className="listings-center">
				<table className="listings-table">
					<thead>
						<tr>
							<th className="listings-col-user">User</th>
							<th className="listings-col-item">Item To Trade</th>
							<th className="listings-col-image">Image</th>
							<th className="listings-col-item">Item Looking For</th>
							<th className="listings-col-preferences">Preferences</th>
							<th className="listings-col-like">Initiate Trade</th>
						</tr>
					</thead>
					<tbody>
						{otherListings.map((trade) => (
							<tr key={trade._id}>
								<td className="listings-col-user" onClick={() => navigate(`/profile/${trade.user_id}`)}>{trade.username}</td>
								<td className="listings-col-item">{trade.have}</td>
								<td className="listings-col-image"><img src={`${process.env.REACT_APP_BACKEND_URL}${trade.image_url}`} alt="Item" /></td>
								<td className="listing-col-item">{trade.want}</td>
								<td className="listings-col-preferences">{trade.preferences}</td>
								<td className="listings-col-like"><button className="like-button" onClick={handleLike}><FaHeart /></button></td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
			<div className="listings-bottom">
				<button className="function-button" onClick={() => navigate("/add-listings")}>Add a Listing</button>
				<button className="function-button" onClick={handleLogout}>Logout</button>
			</div>
		</div>
	);
}

export default Listings;