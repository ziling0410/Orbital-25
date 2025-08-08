import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import "./Notifications.css";

function Notifications({userId: propUserId}) {
    const [notifications, setNotifications] = useState([]);
    const navigate = useNavigate();
	const [userId, setUserId] = useState(propUserId);
	const [userProfile, setUserProfile] = useState(null);

	useEffect(() => {
		if (propUserId) {
			setUserId(propUserId);
		}
	}, [propUserId]);

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
        if (!userId) return;

        const fetchNotifications = async () => {
            try {
				const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/notifications-history?userId=${userId}`);
                const data = await response.json();
                setNotifications(data);
            } catch (error) {
                console.error("Error fetching notifications:", error);
            }
        };
        fetchNotifications();
	}, [userId]);

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

	if (!userProfile) {
		return null;
	}

    return (
		<div className="notifications-entire">
			<div className="notifications-top">
				<div className="notifications-top-left" onClick={handleHomeClick}>
					<h1 className="home-brand">MERCHMATES</h1>
				</div>
				<div className="notifications-top-right" onClick={handleProfileClick}>
					<p>{userProfile.username}</p>
					<img src={`${process.env.REACT_APP_BACKEND_URL}${userProfile.image_url}`} alt="Profile" className="profile-pic" />
				</div>
			</div>
			<div className="notifications-content">
				{notifications.length === 0 ? (
					<p>No notifications yet.</p>
				) : (
					<table className="notifications-table">
						<thead>
							<tr>
								<th className="notifications-col-user">User</th>
								<th className="notifications-col-message">Message</th>
								<th className="notifications-col-time">Time</th>
							</tr>
						</thead>
						<tbody>
							{notifications.map((notification) => (
								<tr key={notification._id} onClick={() => navigate(`/trade/${notification.trade_id}`)}>
									<td className="notifications-col-user">{notification.sender_username}</td>
									<td className="notifications-col-message">{notification.message}</td>
									<td className="notifications-col-time">{new Date(notification.created_at).toLocaleString()}</td>
								</tr>
							)) }
						</tbody>
					</table>
				)}
			</div>
        </div>
    );
}

export default Notifications;