import React, { useRef, useState, useEffect } from "react";
import "./Chat.css";  

function ChatWidget({
  userId,
  peerId,
  wsUrl,
  header = "Chat"
}) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [connected, setConnected] = useState(false);
  const ws = useRef(null);
  const messagesEl = useRef(null);
  const inputEl = useRef(null);

  useEffect(() => {
    if (!userId || !peerId || !wsUrl) return;
    ws.current = new WebSocket(wsUrl);

    ws.current.onopen = () => {
      setConnected(true);
      ws.current.send(JSON.stringify({ type: "join", userId, peerId }));
    };

    ws.current.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.type === "chat-message") {
          setMessages(prev => [...prev, msg.data]);
        } else if (msg.type === "history") {
          setMessages(msg.data || []);
        }
      } catch (err) {
      }
    };

    ws.current.onclose = () => {
      setConnected(false);
    };

    ws.current.onerror = (err) => {
      setConnected(false);
    };

    return () => {
      ws.current && ws.current.close();
    };
  }, [userId, peerId, wsUrl]);

  useEffect(() => {
    if (messagesEl.current) {
      messagesEl.current.scrollTop = messagesEl.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || !connected || !ws.current) return;
    const msg = { sender: userId, recipient: peerId, text };
    ws.current.send(JSON.stringify({ type: "chat-message", data: msg }));
    setInput("");
  };

  const handleClear = () => setMessages([]);

  return (
    <div className="chat-widget" role="region" aria-label={`Chat with user ${peerId}`}>
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
          ref={inputEl}
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