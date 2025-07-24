import React, { useEffect, useState } from "react";
import { supabase } from "../App";
import { useNavigate, useParams } from "react-router-dom";
import { Rating } from "react-simple-star-rating";

function Review() {
	const { tradeId } = useParams();
	const [review, setReview] = useState("");
	const [rating, setRating] = useState(0);
	const [message, setMessage] = useState("");
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

	const ratingChanged = (newRating) => {
		setRating(newRating);
        console.log("Rating changed to:", newRating);
	}

	const submitReview = async () => {

		const formData = new FormData();
		formData.append("review", review);
		formData.append("rating", rating);
		formData.append("reviewer_id", userId);
		formData.append("trade_id", tradeId);

		const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/review`, {
			method: "POST",
			body: formData,
		});

		if (response.ok) {
			setMessage("Review added successfully");
			navigate("/get-listings");
		} else {
			const error = await response.json();
			setMessage("Error: " + error.message);
		}
	};

	const handleLogout = async () => {
		await supabase.auth.signOut();
		navigate("/");
	};

	const handleProfileClick = () => {
		if (!userId) {
			navigate("/login");
		} else {
			navigate("/profile");
		}
	};

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

	if (!userProfile) {
		return null;
	}

	return (
		<div className="review-entire">
			<div className="review-top">
				<div className="review-top-left">
					<h1>Review your trade</h1>
				</div>
				<div className="review-top-right" onClick={handleProfileClick}>
					<p>{userProfile.username}</p>
					<img src={`${process.env.REACT_APP_BACKEND_URL}${userProfile.image_url}`} alt="Profile" className="profile-pic" />
				</div>
			</div>
			<div className="review-center">
				<Rating
					onClick={ratingChanged}
				/>
				<br />
				<input
					className="input"
					type="text"
					placeholder="Review"
					value={review}
					onChange={event => setReview(event.target.value)}
				/>
				<br />
				<button className="add-button" onClick={event => {
					event.preventDefault();
					submitReview();
				}}>Submit Review</button>
			</div>
			<div className="review-bottom">
				<button className="add-button" onClick={handleLogout}>Logout</button>
			</div>
		</div>
	)
}

export default Review;