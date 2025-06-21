import { useParams } from "react-router-dom";
import { supabase } from "../App";
import React, { useEffect, useState } from "react";

function Trade() {
	const { tradeId } = useParams();
	const [trade, setTrade] = useState(null);
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
		if (!userId || !tradeId) return;

		const fetchTrade = async () => {
			try {
				const response = await fetch(`http://localhost:3000/trade/${tradeId}`);
				if (response.ok) {
					const data = await response.json();
					setTrade(data);
				} else {
					console.log("Failed to fetch trade");
				}
			} catch (error) {
				console.log("Error fetching trade: ", error);
			}
		};

		fetchTrade();
	}, [userId, tradeId]);

	if (!userId || !trade) {
		return null;
	}

	return (
		<div>
			{userId === trade["userA_id"] ? (
				<div>
					<p>Your Item: {trade["userA_have"]}</p>
					<p>Their Item: {trade["userB_have"]}</p>
				</div>
			) : userId === trade["userB_id"] ? (
				<div>
					<p>Your Item: {trade["userB_have"]}</p>
					<p>Their Item: {trade["userA_have"]}</p>
				</div>
			) : (
				<p>You are not part of this trade.</p>
			)}
		</div>		
    );
}

export default Trade;