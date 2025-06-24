import React, { useEffect, useState, useCallback } from "react";
import { supabase } from "../App";
import { useNavigate } from "react-router-dom";
import { FaHeart } from "react-icons/fa";
import SearchBar from "./SearchBar";
import "./Listings.css";

function Listings() {
	const [userId, setUserId] = useState(null);
	const [username, setUsername] = useState("");
	const [myListings, setMyListings] = useState([]);
	const [otherListings, setOtherListings] = useState([]);
	const [myIndex, setMyIndex] = useState(0);
    const [otherIndex, setOtherIndex] = useState(0);
	const [searchInput, setSearchInput] = useState("");
	const navigate = useNavigate();

	useEffect(() => {
		const getUser = async () => {
			const { data: { user } } = await supabase.auth.getUser();
			if (user) {
				console.log("UID during username fetch: ", user.id);
				setUserId(user.id);
			}
		};
		getUser();
	}, []);

	useEffect(() => {
		const fetchUsername = async () => {
			try {
				const response = await fetch("http://localhost:3000/get-username", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({ id: userId }),
				});

				if (response.ok) {
					const data = await response.json();
					setUsername(data.username);
				} else {
					console.log("Failed to fetch username");
				}
			} catch (error) {
				console.log("Error fetching username: ", error);
			}
		};

		if (userId) {
			fetchUsername();
		}
	}, [userId]);

	const fetchListings = useCallback(async () => {
		const responseOthers = await fetch(`http://localhost:3000/get-listings?excludeId=${userId}`);
		const responseSelf = await fetch(`http://localhost:3000/get-listings?id=${userId}`);
		const dataOthers = await responseOthers.json();
		const dataSelf = await responseSelf.json();
		setMyListings(dataSelf);
		setOtherListings(dataOthers);
	}, [userId]);

	useEffect(() => {
		fetchListings();
	}, [userId, fetchListings]);

	const displayListings = (listing) => {
		return (
			<div className="listings-card">
				<h3>wtt - {listing.have}</h3>
				<img src={`http://localhost:3000${listing.image_url}`} alt="Item" />
				<h3>want - {listing.want}</h3>
			</div>
		)
	}
	
	const handleHomeClick = () => {
		navigate("/");
	};

	const handleLogout = async () => {
		await supabase.auth.signOut();
		navigate("/");
	};

	const handleSearch = async () => {
		const searchResponseOthers = await fetch(`/search-listings?keyword=${encodeURIComponent(searchInput)}&excludeId=${userId}`);
		const searchResponseSelf = await fetch(`/search-listings?keyword=${encodeURIComponent(searchInput)}&id=${userId}`);
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
		const response = await fetch("http://localhost:3000/start-trade", {
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
				<div className="listings-top-right">
					<p>{username}</p>
				</div>
			</div>
			<div className="listings-center">
				<div className="listings-center-left">
					<div className="listings-center-left-box">
						<div className="prev-button">
							<button className="nav-button" onClick={() => setOtherIndex(i => Math.max(i - 1, 0))}>˄</button>
						</div>
						<div className="listings-center-center">
							{otherListings.length > 0 && displayListings(otherListings[otherIndex])}
						</div>
						<div className="listings-center-left-bottom">
							<div className="listings-center-left-bottom-nav">
								<button className="nav-button" onClick={() => setOtherIndex(i => Math.min(i + 1, otherListings.length - 1))}>˅</button>
							</div>
							<div className="listings-center-left-bottom-like">
								<button className="like-button" onClick={handleLike}><FaHeart /></button>
							</div>
						</div>
					</div>
				</div>
				<div className="listings-center-right">
					<div className="listings-center-right-box">
						<div className="prev-button">
							<button className="nav-button" onClick={() => setMyIndex(i => Math.max(i - 1, 0))}>˄</button>
						</div>
						<div className="listings-center-center">
							{myListings.length > 0 && displayListings(myListings[myIndex])}
						</div>
						<div className="next-button">
							<button className="nav-button" onClick={() => setMyIndex(i => Math.min(i + 1, myListings.length - 1))}>˅</button>
						</div>
					</div>
				</div>
			</div>
			<div className="listings-bottom">
				<button className="function-button" onClick={() => navigate("/add-listings")}>Add a Listing</button>
				<button className="function-button" onClick={handleLogout}>Logout</button>
			</div>
		</div>
	);
}

export default Listings;