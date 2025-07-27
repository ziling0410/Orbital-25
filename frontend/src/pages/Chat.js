import React, { useRef, useState, useEffect } from "react";
import { io } from "socket.io-client";
import "./Chat.css";

function ChatWidget({ userId, peerId, wsUrl, header = "Chat" }) {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [connected, setConnected] = useState(false);
    const [peerProfile, setPeerProfile] = useState(null);
    const socketRef = useRef(null);
    const messagesEl = useRef(null);

    useEffect(() => {
        if (!userId || !peerId || !wsUrl) return;

        socketRef.current = io(wsUrl, {
            transports: ["websocket"],
        });

        socketRef.current.on("connect", () => {
            console.log("Connected to socket server"); // <-- Check this console
            setConnected(true);
            socketRef.current.emit("join", { userId, peerId });
        });

        socketRef.current.on("history", (history) => {
            setMessages(history || []);
        });

        socketRef.current.on("chat-message", (msg) => {
            setMessages((prev) => [...prev, msg]);
        });

        socketRef.current.on("disconnect", () => {
            console.log("Disconnected from socket server");
            setConnected(false);
        });

        socketRef.current.on("connect_error", (error) => {
            console.error("Socket connection error:", error);
            setConnected(false);
        });

        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
                socketRef.current = null;
            }
        };
    }, [userId, peerId, wsUrl]);


    useEffect(() => {
        if (messagesEl.current) {
            messagesEl.current.scrollTop = messagesEl.current.scrollHeight;
        }
    }, [messages]);

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
                    setPeerProfile(profileData);
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

    const handleSend = (e) => {
        e.preventDefault();
        const text = input.trim();
        if (!text || !connected || !socketRef.current) return;

        const msg = { sender: userId, recipient: peerId, text };
        socketRef.current.emit("chat-message", msg);
        setInput("");
    };

    const handleClear = () => setMessages([]);

    return (
        <div className="chat-widget" role="region" aria-label={`Chat with user ${peerProfile.username}`}>
            <div className="chat-widget__header">
                {header} with {peerId} {connected ? "🟢" : "🔴"}
            </div>
            <div
                className="chat-widget__messages"
                ref={messagesEl}
                tabIndex={-1}
                aria-live="polite"
                aria-relevant="additions"
            >
                {messages.length === 0 ? (
                    <div style={{ textAlign: "center", color: "#888" }}>
                        No messages yet. Say hello!
                    </div>
                ) : (
                    messages.map((msg, i) => (
                        <div
                            key={i}
                            className={
                                "chat-widget__message " +
                                (msg.sender === userId
                                    ? "chat-widget__message--out"
                                    : "chat-widget__message--in")
                            }
                            aria-label={`${msg.sender === userId ? "You" : `User ${msg.sender}`} said: ${msg.text}`}
                        >
                            {msg.text}
                        </div>
                    ))
                )}
            </div>
            <form className="chat-widget__form" autoComplete="off" onSubmit={handleSend}>
                <input
                    className="chat-widget__input"
                    type="text"
                    placeholder="Type a message…"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    disabled={!connected}
                    aria-label="Type your message"
                />
                <button className="chat-widget__btn" type="submit" disabled={!connected || !input.trim()}>
                    Send
                </button>
            </form>
            <button
                className="chat-widget__clear"
                type="button"
                onClick={handleClear}
                aria-label="Clear chat messages"
            >
                Clear Chat
            </button>
        </div>
    );
}

export default ChatWidget;
