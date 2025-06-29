import { useEffect, useRef } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const POLL_INTERVAL = 5000;

function useNotificationPoller(userId) {
    const seenNotificationIds = useRef(new Set());
    const navigate = useNavigate();

    useEffect(() => {
        if (!userId) return;

        const pollNotifications = async () => {
            try {
                const response = await fetch(`/notifications?userId=${userId}`);

                if (!response.ok) {
                    console.error("Server error: ", response.status);
                    return;
                }

                const notifications = await response.json();

                notifications.forEach((n) => {
                    if (!seenNotificationIds.current.has(n._id)) {
                        toast.info(n.message, {
                            autoClose: false,
                            closeOnClick: true,
                            onClick: () => {
                                navigate(`/trade/${n.trade_id}`);

                                fetch(`/mark-notification-read`, {
                                    method: "POST",
                                    headers: {
                                        "Content-Type": "application/json",
                                    },
                                    body: JSON.stringify({ notificationId: n._id }),
                                });

                                seenNotificationIds.current.add(n._id);
                            },
                        });
                    }
                });
            } catch (error) {
                console.error("Polling error:", error);
            }
        };

        const intervalId = setInterval(pollNotifications, POLL_INTERVAL);
        return () => clearInterval(intervalId);
    }, [userId, navigate]);
}

export default useNotificationPoller;
