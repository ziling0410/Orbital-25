import useNotificationPoller from "./hooks/useNotificationPoller.js";

function NotificationPollerWrapper({ userId }) {
    useNotificationPoller(userId);
    return null;
}

export default NotificationPollerWrapper;
