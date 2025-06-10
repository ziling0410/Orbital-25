import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../App";
import "./Profile.css";

function Profile() {
	const [activeTab, setActiveTab] = useState("reviews");
	const [isFollowing, setIsFollowing] = useState(false);
	const [showReviewModal, setShowReviewModal] = useState(false);
	const [reviewRating, setReviewRating] = useState(0);
	const [reviewText, setReviewText] = useState("");
	const [message, setMessage] = useState("");
	const [searchQuery, setSearchQuery] = useState("");
	const [userProfile, setUserProfile] = useState(null);

	const [reviews, setReviews] = useState([
		{ id: 1, rating: 5, reviewer: "John", location: "NYC", date: "2025-05-20", text: "Nice and friendly trader!" },
		{ id: 2, rating: 4, reviewer: "Jane", location: "LA", date: "2025-05-18", text: "Thank you for the trade." }
	]);

	const navigate = useNavigate();

	useEffect(() => {
		checkUser();
	}, []);

	const checkUser = async () => {
		const { data: { user }, error } = await supabase.auth.getUser();
		if (!user) {
			navigate("/login");
		} else {
			fetchProfile(user.id);
		}
	};

	const fetchProfile = async (userId) => {
		const { data, error } = await supabase
			.from("profiles")
			.select("*")
			.eq("id", userId)
			.single();

		if (error) {
			console.error("Error loading profile:", error.message);
		} else {
			setUserProfile(data);
		}
	};

	const handleFollow = () => {
		setIsFollowing(!isFollowing);
		setMessage(isFollowing ? "Unfollowed Zi Ling" : "Now following Zi Ling!");
		setTimeout(() => setMessage(""), 3000);
	};

	const handleStarClick = (rating) => {
		setReviewRating(rating);
	};

	const handleReviewSubmit = () => {
		if (reviewRating === 0 || reviewText.trim() === "") {
			setMessage("Please provide a rating and review.");
			setTimeout(() => setMessage(""), 3000);
			return;
		}

		const newReview = {
			id: reviews.length + 1,
			rating: reviewRating,
			reviewer: "You",
			location: "Singapore",
			date: new Date().toISOString().split("T")[0],
			text: reviewText
		};

		setReviews([newReview, ...reviews]);
		setShowReviewModal(false);
		setReviewText("");
		setReviewRating(0);
		setMessage("Review submitted successfully!");
		setTimeout(() => setMessage(""), 3000);
	};

	const handleSearch = (e) => {
		if (e.key === "Enter" && searchQuery.trim()) {
			setMessage(`Searching for: ${searchQuery}`);
			setTimeout(() => setMessage(""), 3000);
		}
	};

	const handleMenuToggle = () => {
		setMessage("Menu clicked!");
		setTimeout(() => setMessage(""), 2000);
	};

	const renderStars = (rating, interactive = false, onClick = null) => {
		return Array.from({ length: 5 }, (_, index) => (
			<span
				key={index}
				className={`star ${index < rating ? "filled" : ""} ${interactive ? "interactive" : ""}`}
				onClick={interactive ? () => onClick(index + 1) : undefined}
			>
				★
			</span>
		));
	};

	const renderTabContent = () => {
		switch (activeTab) {
			case "reviews":
				return (
					<div className="reviews-container">
						{reviews.map((review) => (
							<div key={review.id} className="review-card">
								<div className="review-header">
									<div className="review-stars">{renderStars(review.rating)}</div>
									<div className="review-meta">
										{review.reviewer} | {review.location} | {review.date}
									</div>
								</div>
								<p className="review-text">"{review.text}"</p>
							</div>
						))}
					</div>
				);
			case "about":
				return (
					<div className="about-content">
						<h3>About {userProfile?.username || "User"}</h3>
						<p>{userProfile?.about_text || "No bio provided yet."}</p>

						<h4>Trading Preferences:</h4>
						<ul>
							{userProfile?.preferences?.length
								? userProfile.preferences.map((pref, i) => <li key={i}>{pref}</li>)
								: <li>No preferences listed.</li>}
						</ul>

						<h4>Collection Highlights:</h4>
						<ul>
							{userProfile?.highlights?.length
								? userProfile.highlights.map((item, i) => <li key={i}>{item}</li>)
								: <li>No highlights yet.</li>}
						</ul>
					</div>
				);
			case "listings":
				return (
					<div className="listings-content">
						<h3>Current Listings</h3>
						<div className="listing-grid">
							{/* Example static card - Replace with dynamic MongoDB data if needed */}
							<div className="listing-card">
								<img src="http://localhost:3000/uploads/seventeen.jpg" alt="Listing" width="150" />
								<h4>Seventeen - God of Music</h4>
								<p>Photocard Set</p>
								<span className="price">$25</span>
							</div>
						</div>
					</div>
				);
			default:
				return null;
		}
	};

	return (
		<div className="profile-container">
			<header className="header">
				<div className="hamburger-menu" onClick={handleMenuToggle}>
					<span></span><span></span><span></span>
				</div>
				<div className="search-container">
					<input
						type="text"
						className="search-bar"
						placeholder="Search..."
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						onKeyPress={handleSearch}
					/>
					<button className="mic-button">🎤</button>
				</div>
				<div className="user-info">
					<div className="chat-icon">💬</div>
					<span className="username">{userProfile?.username || "Zi Ling"}</span>
					<img 
						src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=50&h=50&fit=crop&crop=face" 
						alt="Profile" 
						className="header-avatar" 
					/>
				</div>
			</header>

			<main className="profile-main">
				<div className="profile-header">
					<img 
						src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face" 
						alt="Zi Ling" 
						className="profile-avatar" 
					/>
					<div className="profile-info">
						<h1 className="profile-name">{userProfile?.username || "Zi Ling"}</h1>
						<p className="profile-bio">{userProfile?.about_text || "K-pop collector and card trader."}</p>
						<div className="location">📍 Singapore</div>
						<div className="rating-section">
							<span className="rating-label">Average Rating:</span>
							<div className="stars">{renderStars(4)}</div>
							<span className="rating-score">4.2 (120 reviews)</span>
						</div>
						<div className="action-buttons">
							<button className="write-review-btn" onClick={() => setShowReviewModal(true)}>Write a Review</button>
							<button className={`follow-btn ${isFollowing ? "following" : ""}`} onClick={handleFollow}>
								{isFollowing ? "Following" : "Follow"}
							</button>
						</div>
					</div>
				</div>

				<nav className="profile-nav">
					<button className={`nav-tab ${activeTab === "reviews" ? "active" : ""}`} onClick={() => setActiveTab("reviews")}>Reviews</button>
					<button className={`nav-tab ${activeTab === "about" ? "active" : ""}`} onClick={() => setActiveTab("about")}>About</button>
					<button className={`nav-tab ${activeTab === "listings" ? "active" : ""}`} onClick={() => setActiveTab("listings")}>Listings</button>
				</nav>

				<div className="tab-content">{renderTabContent()}</div>
				{message && <p className="message">{message}</p>}

				<button className="button" onClick={() => navigate("/get-listings")}>Back to Listings</button>
			</main>

			{showReviewModal && (
				<div className="modal">
					<div className="modal-content">
						<span className="close" onClick={() => setShowReviewModal(false)}>&times;</span>
						<h2>Write a Review</h2>
						<div className="rating-input">
							<label>Rating:</label>
							<div className="star-rating">{renderStars(reviewRating, true, handleStarClick)}</div>
						</div>
						<textarea
							placeholder="Write your review..."
							value={reviewText}
							onChange={(e) => setReviewText(e.target.value)}
							required
						/>
						<button type="button" onClick={handleReviewSubmit} className="submit-review-btn">
							Submit Review
						</button>
					</div>
				</div>
			)}
		</div>
	);
}

export default Profile;
