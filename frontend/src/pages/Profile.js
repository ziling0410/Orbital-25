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
  const [reviews, setReviews] = useState([]);
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
    setMessage("");
    try {
      const response = await fetch('/get-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: userId })
      });
      
      if (response.ok) {
        const profileData = await response.json();
        setUserProfile(profileData);
        fetchReviews(userId);
      } else {
        setMessage("Error loading profile");
      }
    } catch (error) {
      setMessage("Network error loading profile");
    }
  };

  const fetchReviews = async (userId) => {
    try {
      const response = await fetch('/get-reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });
      
      if (response.ok) {
        const reviewsData = await response.json();
        setReviews(reviewsData);
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
    }
  };

  const handleFollow = () => {
    setIsFollowing(!isFollowing);
    setMessage(isFollowing ? `Unfollowed ${userProfile?.username}` : `Now following ${userProfile?.username}!`);
    setTimeout(() => setMessage(""), 3000);
  };

  const handleStarClick = (rating) => {
    setReviewRating(rating);
  };

  const handleReviewSubmit = async () => {
    if (reviewRating === 0 || reviewText.trim() === "") {
      setMessage("Please provide a rating and review.");
      setTimeout(() => setMessage(""), 3000);
      return;
    }

    try {
      const response = await fetch('/submit-review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userProfile.id,
          rating: reviewRating,
          text: reviewText
        })
      });

      if (response.ok) {
        fetchReviews(userProfile.id);
        setShowReviewModal(false);
        setReviewText("");
        setReviewRating(0);
        setMessage("Review submitted successfully!");
        setTimeout(() => setMessage(""), 3000);
      } else {
        setMessage("Error submitting review");
      }
    } catch (error) {
      setMessage("Network error submitting review");
    }
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
        className={`star ${index < rating ? "filled" : ""}`}
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
                  <div className="review-stars">
                    {renderStars(review.rating)}
                  </div>
                  <div className="review-meta">
                    {review.reviewer} • {review.location} • {review.date}
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
            <p>{userProfile?.description || "No bio provided yet."}</p>
          </div>
        );
      case "listings":
        return (
          <div className="listings-content">
            <div className="listing-grid">
              <div className="listing-card">
                <img src="/photocard1.jpg" alt="Photocard Set" />
                <h4>Stray Kids Photocard Set</h4>
                <p>Complete set of 8 photocards</p>
                <p className="price">$25</p>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  if (!userProfile) return <p>Loading profile...</p>;

  return (
    <div className="container">
      <div className="header">
        <div className="hamburger-menu" onClick={handleMenuToggle}>
          <span></span>
          <span></span>
          <span></span>
        </div>
        <div className="search-container">
          <input
            type="text"
            className="search-bar"
            placeholder="Search for items or users"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleSearch}
          />
          <button className="mic-button">🎤</button>
        </div>
        <div className="user-info">
          <span className="username">{userProfile?.username}</span>
          <span className="chat-icon">💬</span>
          <img
            src={userProfile?.profile_picture || "/default-avatar.jpg"}
            alt="Profile"
            className="header-avatar"
          />
        </div>
      </div>

      <div className="profile-main">
        <div className="profile-header">
          <img
            src={userProfile?.profile_picture || "/default-avatar.jpg"}
            alt="Profile"
            className="profile-avatar"
          />
          <div className="profile-info">
            <h1 className="profile-name">{userProfile?.username}</h1>
            <p className="profile-bio">
              {userProfile?.description}
            </p>
            <p className="location">
              {userProfile?.location || "Location not set"}
            </p>
            <div className="rating-section">
              <span className="rating-label">Rating:</span>
              <div className="stars">
                {renderStars(4.5)}
              </div>
              <span className="rating-score">4.5/5.0</span>
            </div>
            <div className="action-buttons">
              <button
                className="write-review-btn"
                onClick={() => setShowReviewModal(true)}
              >
                Write Review
              </button>
              <button
                className={`follow-btn ${isFollowing ? "following" : ""}`}
                onClick={handleFollow}
              >
                {isFollowing ? "Following" : "Follow"}
              </button>
            </div>
          </div>
        </div>

        <div className="profile-nav">
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

        <div className="tab-content">
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

        {message && <div className="message">{message}</div>}
      </div>

      <div className={`modal ${showReviewModal ? "active" : ""}`}>
        <div className="modal-content">
          <span className="close" onClick={() => setShowReviewModal(false)}>
            &times;
          </span>
          <h2>Write a Review</h2>
          <div className="rating-input">
            <label>Your Rating:</label>
            <div className="star-rating">
              {renderStars(reviewRating, true, handleStarClick)}
            </div>
          </div>
          <textarea
            placeholder="Share your experience..."
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
          ></textarea>
          <button type="submit" onClick={handleReviewSubmit}>
            Submit Review
          </button>
        </div>
      </div>
    </div>
  );
}

export default Profile;
