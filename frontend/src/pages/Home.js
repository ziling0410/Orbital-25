import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";
import SearchBar from "./SearchBar";
import { supabase } from "../App";

function Home() {
	const [userId, setUserId] = useState(null);
	const [searchInput, setSearchInput] = useState("");
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

	const handleSearch = async () => {
		if (!userId) {
			navigate("/login");
		}
		else {
			navigate("/get-listings");
		}
	};

	const handleTrade = async () => {
		if (!userId) {
			navigate("/login");
		} else {
			navigate("/get-listings");
		}
	};

	const handleClearSearch = () => {
		setSearchInput("");
	};
		
	return (
		<div className="home-entire">
			<div className="top">
				<div className="top-center">
					<SearchBar
						searchInput={searchInput}
						setSearchInput={setSearchInput}
						handleSearch={handleSearch}
                        handleClearSearch={handleClearSearch}
					/>
				</div>
				<div className="top-right">
					<button className="button" onClick={() => navigate("/register")}>Register</button>
					<button className="button" onClick={() => navigate("/login")}>Login</button>
				</div>
			</div>
			<div className="bottom">
				<div className="left">
					<div className="left-top">
						<img src="/home.png" alt="Icon"></img>
						<h1 className="reborn">MERCHMATES</h1>
					</div>
					<div className="left-bottom">
						<p className="hero">CONNECTING FANS WORLDWIDE WITH A SIMPLE CLICK</p>
					</div>
				</div>
				<div className="right">
					<div className="right-box">
						<button className="trade" onClick={handleTrade}>Trade</button>
					</div>
				</div>
			</div>
		</div>
	);
}

export default Home;