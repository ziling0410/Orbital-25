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
                await fetchUserProfile(user.id);
            }
        };
        getUser();
    }, []);

    const fetchUserProfile = async (userId) => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();

            if (data) {
                setUserProfile(data);
            }
        } catch (error) {
            console.error('Error fetching user profile:', error);
        }
    };

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

    const handleClearSearch = () => {
        setSearchInput("");
    };

    const handleProfileClick = () => {
        if (!userId) {
            navigate("/login");
        } else {
            navigate("/profile");
        }
    };

    const handleHomeClick = () => {
        navigate("/");
    };

    return (
        <div className="home-entire">
            <div className="top">
                <div className="home-logo" onClick={handleHomeClick}></div>
                <div className="top-center">
                    <SearchBar
                        searchInput={searchInput}
                        setSearchInput={setSearchInput}
                        handleSearch={handleSearch}
                        handleClearSearch={handleClearSearch}
                    />
                </div>
                <div className="top-right">
                    {userId ? (
                        <div className="user-info">
                            <span className="username">
                                {userProfile?.username || 'User'}
                            </span>
                            <div className="profile-container" onClick={handleProfileClick}>
                                <img 
                                    src={userProfile?.profile_picture || "/default-profile.png"} 
                                    alt="Profile" 
                                    className="profile-picture-small"
                                    onError={(e) => {
                                        e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'%3E%3Ccircle cx='20' cy='20' r='20' fill='%23f1ebe5'/%3E%3Ccircle cx='20' cy='16' r='6' fill='%23999'/%3E%3Cpath d='M20 24c-5 0-9 2.5-9 6v2h18v-2c0-3.5-4-6-9-6z' fill='%23999'/%3E%3C/svg%3E";
                                    }}
                                />
                            </div>
                        </div>
                    ) : (
                        <>
                            <button className="button" onClick={() => navigate("/register")}>Register</button>
                            <button className="button" onClick={() => navigate("/login")}>Login</button>
                        </>
                    )}
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