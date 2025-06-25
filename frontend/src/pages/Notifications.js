import React, { useState, useEffect } from 'react';
import { supabase } from "../App";
import { useNavigate } from 'react-router-dom';
import "./Notifications.css";

function Notifications() {
    const [notifications, setNotifications] = useState([]);
    const navigate = useNavigate();
	const [userId, setUserId] = useState(null);
	const [username, setUsername] = useState("");

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

    useEffect(() => {
        if (!userId) return;

        const fetchNotifications = async () => {
            try {
                const response = await fetch(`/notifications-history?userId=${userId}`);
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

    return (
		<div className="notifications-entire">
			<div className="notifications-top">
				<div className="notifications-top-left" onClick={handleHomeClick}>
					<h1 className="home-brand">MERCHMATES</h1>
				</div>
				<div className="notifications-top-right">
					<p>{username}</p>
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