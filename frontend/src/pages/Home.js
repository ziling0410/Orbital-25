import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";
import SearchBar from "./SearchBar";
import { supabase } from "../App";

function Home() {
    const [userId, setUserId] = useState(null);
    const [userProfile, setUserProfile] = useState(null);
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

    const handleSearch = async () => {
        if (!userId) {
            navigate("/login");
        } else {
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

    const handleNotifications = async () => {
        if (!userId) {
            navigate("/login");
        } else {
            navigate("/notifications");
        }
    };

    const handleTradeHistory = async () => {
        if (!userId) {
            navigate("/login");
        } else {
            navigate("/trade-history");
        }
    };

    const handleClearSearch = () => {
        setSearchInput("");
    };

    const handleProfileClick = () => {
        if (!userId) {
            navigate("/login");
        } else {
            navigate(`/profile/${userId}`);
        }
    };

    const handleHomeClick = () => {
        navigate("/");
    };

    const handleChat = () => {
        navigate("/chat");
    };

    if (!userProfile) {
        return (
            <div className="home-entire">
                <div className="home-top">
                    <div className="home-top-left" onClick={handleHomeClick}>
                        <h1 className="home-brand">MERCHMATES</h1>
                    </div>
                    <div className="home-top-center">
                        <SearchBar
                            searchInput={searchInput}
                            setSearchInput={setSearchInput}
                            handleSearch={handleSearch}
                            handleClearSearch={handleClearSearch}
                        />
                    </div>
                    <div className="home-top-right-new">
                        <button className="button" onClick={() => navigate("/register")}>Register</button>
                        <button className="button" onClick={() => navigate("/login") }>Login</button>
                    </div>
                </div>
                <div className="home-bottom">
                    <div className="home-bottom-left">
                        <div className="home-bottom-left-top">
                            <img src="/home.png" alt="Icon"></img>
                            <h1 className="reborn">MERCHMATES</h1>
                        </div>
                        <div className="home-bottom-left-bottom">
                            <p className="hero">CONNECTING FANS WORLDWIDE WITH A SIMPLE CLICK</p>
                        </div>
                    </div>
                    <div className="home-bottom-right">
                        <div className="home-bottom-right-box">
                            <button className="trade" onClick={handleTrade}>Trade</button>
                            <button className="trade" onClick={handleNotifications}>Notifications</button>
                        </div>
                    </div>
                </div>
            </div>
        );;
    }

    return (
        <div className="home-entire">
            <div className="home-top">
                <div className="home-top-left" onClick={handleHomeClick}>
                    <h1 className="home-brand">MERCHMATES</h1>
                </div>
                <div className="home-top-center">
                    <SearchBar
                        searchInput={searchInput}
                        setSearchInput={setSearchInput}
                        handleSearch={handleSearch}
                        handleClearSearch={handleClearSearch}
                    />
                </div>
                <div className="home-top-right" onClick={handleProfileClick}>
                    <p>{userProfile.username}</p>
                    <img src={`${process.env.REACT_APP_BACKEND_URL}${userProfile.image_url}`} alt="Profile" className="profile-pic" />
                </div>
            </div>
            <div className="home-bottom">
                <div className="home-bottom-left">
                    <div className="home-bottom-left-top">
                        <img src="/home.png" alt="Icon"></img>
                        <h1 className="reborn">MERCHMATES</h1>
                    </div>
                    <div className="home-bottom-left-bottom">
                        <p className="hero">CONNECTING FANS WORLDWIDE WITH A SIMPLE CLICK</p>
                    </div>
                </div>
                <div className="home-bottom-right">
                    <div className="home-bottom-right-box">
                        <button className="trade" onClick={handleTrade}>Trades</button>
                        <button className="trade" onClick={handleNotifications}>Notifications</button>
                        <button className="trade" onClick={handleTradeHistory}>Trade History</button>
                        <button className="trade" onClick={handleChat}>Chat</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Home;