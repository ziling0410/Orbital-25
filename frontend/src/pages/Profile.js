import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../App";
import { CiMapPin } from "react-icons/ci";
import { Rating } from "react-simple-star-rating";
import "./Profile.css";

function Profile() {
	const { userId } = useParams();
	const [activeTab, setActiveTab] = useState("about");
	const [userProfile, setUserProfile] = useState(null);
	const [rating, setRating] = useState(0);
	const [totalReviews, setTotalReviews] = useState(0);
	const [myListings, setMyListings] = useState([]);
	const [reviews, setReviews] = useState([]);
    const [completedTradeNumber, setCompletedTradeNumber] = useState(0);
	const navigate = useNavigate();

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

	useEffect(() => {
		const fetchCompletedTrades = async () => {
			try {
				const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/get-completed-trades-number?id=${userId}`);
				if (response.ok) {
					const completedTradeNumber = await response.json();
					setCompletedTradeNumber(completedTradeNumber.count);
				} else {
					console.error("Error loading completed trades");
				}
			} catch (error) {
				console.error("Network error loading completed trades:", error);
			}
		};

		if (userId) {
			fetchCompletedTrades();
		}
	}, [userId]);

	useEffect(() => {
		const fetchReviews = async () => {
			try {
				const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/get-reviews?id=${userId}`);
				if (response.ok) {
					const reviewsData = await response.json();
					setReviews(reviewsData);
				} else {
					console.error("Error loading reviews");
				}
			} catch (error) {
				console.error("Network error loading reviews:", error);

			}
		};

		if (userId) {
			fetchReviews();
		}
	}, [userId]);

	useEffect(() => {
		const fetchRating = async () => {
			try {
				const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/get-average-rating?id=${userId}`);
				if (response.ok) {
					const ratingData = await response.json();
					setRating(ratingData.average_rating);
					setTotalReviews(ratingData.total_reviews);
				} else {
					console.error("Error loading rating");
				}
			} catch (error) {
				console.error("Network error loading rating:", error);
			
			}
		};

		if (userId) {
			fetchRating();
		}
	}, [userId]);

	const displayListings = (listing) => {
		return (
			<div className="listings-card">
				<h3>wtt - {listing.have}</h3>
				<img src={`${process.env.REACT_APP_BACKEND_URL}${listing.image_url}`} alt="Item" />
				<h3>want - {listing.want}</h3>
			</div>
		)
	};

	const displayReview = (reviews) => {
		return (
			<div className="review-card">
				<div className="profile-ratings">
					<Rating
						readOnly={true}
						allowFraction={true}
						initialValue={rating}
						disableFillHover={true}
						allowHover={false}
						fillColor="#000000"
						emptyColor="#888888"
					/>
					<p> | {reviews.reviewer.username} | {reviews.reviewer.location} | {new Date(reviews.created_at).toLocaleString()}</p>
				</div>
				<p>"{reviews.review}"</p>
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

	const renderTabContent = () => {
		switch (activeTab) {
			case "about":
				return (
					<div className="about-box">
						<div className="about-box-item">
							<p>Trades: {completedTradeNumber}</p>
							<p>Member since {new Date(userProfile.created_at).getFullYear()}</p>
						</div>
					</div>
				);
			case "listings":
				return (
					<div className="listings">
						<p>Available for Trade:</p>
						<div className="listings-box">
							<div className="listings-box-item">
								{myListings[0] ? displayListings(myListings[0]) : <p>No listings found.</p>}
							</div>
						</div>
					</div>
				);
			case "reviews":
				return (
					<div className="reviews">
						{reviews.slice(0, 3).map((review) => (
							<div className="reviews-box">
								<div className="reviews-box-item">
									{displayReview(review)}
								</div>
							</div>
						))}
					</div>
				)
			default:
				return null;
		}
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
					<img src={`${process.env.REACT_APP_BACKEND_URL}${userProfile.image_url}`} alt="Profile" className="profile-pic" />
				</div>
			</div>
			<div className="profile-center">
				<div className="profile-center-top">
					<div className="profile-center-top-left">
						<img src={`${process.env.REACT_APP_BACKEND_URL}${userProfile.image_url}`} alt="Profile" className="profile-img" />
					</div>
					<div className="profile-center-top-right">
						<p>{userProfile.username}</p>
						<p>{userProfile.description}</p>
						<div className="profile-location">
							<CiMapPin />
							<p>{userProfile.location}</p>
						</div>
						<div className="profile-ratings">
							<p>Average rating: </p>
							<Rating
								readOnly={true}
								allowFraction={true}
								initialValue={rating}
								disableFillHover={true}
								allowHover={false}
								fillColor="#000000"
								emptyColor="#888888"
							/>
							<p>({totalReviews} reviews)</p>
						</div>
					</div>
				</div>
				<div className="profile-center-bottom">
					<div className="profile-center-bottom-nav">
						<button
							className={`nav-tab ${activeTab === "reviews" ? "active" : ""}`}
							onClick={() => setActiveTab("reviews")}
						>
							Reviews
						</button>
						<button
							className={`nav-tab ${activeTab === "about" ? "active" : ""}`}
							onClick={() => setActiveTab("about")}
						>
							About
						</button>
						<button
							className={`nav-tab ${activeTab === "listings" ? "active" : ""}`}
							onClick={() => setActiveTab("listings")}
						>
							Listings
						</button>
					</div>
					<div className="profile-center-bottom-tab-content">
						<div className={`tab-pane ${activeTab === "reviews" ? "active" : ""}`}>
							{renderTabContent()}
						</div>
						<div className={`tab-pane ${activeTab === "about" ? "active" : ""}`}>
                            {renderTabContent()}
						</div>
						<div className={`tab-pane ${activeTab === "listings" ? "active" : ""}`}>
							{renderTabContent()}
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
