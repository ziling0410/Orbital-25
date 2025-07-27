import React, { useRef, useState, useEffect } from "react";
import "./Chat.css";

function ChatWidget({
  userId,
  peerId,
  apiBaseUrl,
  header = "Chat",
}) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEl = useRef(null);

  // Fetch chat history on mount or if user/peer changes
  useEffect(() => {
    if (!userId || !peerId) return;
    setLoading(true);
    fetch(
      `${apiBaseUrl}/chat/messages?user=${encodeURIComponent(
        userId
      )}&peer=${encodeURIComponent(peerId)}`
    )
      .then((res) => res.json())
      .then((msgs) => setMessages(msgs || []))
      .catch(() => setMessages([]))
      .finally(() => setLoading(false));
  }, [userId, peerId, apiBaseUrl]);

  // Scroll to bottom on new message
  useEffect(() => {
    if (messagesEl.current) {
      messagesEl.current.scrollTop = messagesEl.current.scrollHeight;
    }
  }, [messages]);

  // Send new message via API
  const handleSend = async (e) => {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;
    const msg = { sender: userId, recipient: peerId, text };
    setInput("");
    // Optionally add optimistically:
    setMessages((prev) => [...prev, { ...msg }]);
    await fetch(`${apiBaseUrl}/chat/send`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(msg),
    });
    // Optionally, reload from server for full trust:
    // You could remove the following line for latency, but safest is rerun useEffect.
    fetch(
      `${apiBaseUrl}/chat/messages?user=${encodeURIComponent(
        userId
      )}&peer=${encodeURIComponent(peerId)}`
    )
      .then((res) => res.json())
      .then((msgs) => setMessages(msgs || []));
  };

  // Optionally: implement an API that supports clearing chat
  const handleClear = () => {
    setMessages([]);
    // Optionally call your backend API to clear chat history!
  };

  return (
    <div className="chat-widget">
      <div className="chat-widget__header">
        {header} with {peerId}
      </div>
      <div className="chat-widget__messages" ref={messagesEl}>
        {loading ? (
          <div style={{ textAlign: "center", color: "#888" }}>Loading…</div>
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
            >
              {msg.text}
            </div>
          ))
        )}
      </div>
      <form
        className="chat-widget__form"
        autoComplete="off"
        onSubmit={handleSend}
      >
        <input
          className="chat-widget__input"
          type="text"
          value={input}
          placeholder="Type a message…"
          onChange={(e) => setInput(e.target.value)}
        />
        <button className="chat-widget__btn" type="submit">
          Send
        </button>
      </form>
      <button
        className="chat-widget__clear"
        type="button"
        onClick={handleClear}
      >
        Clear Chat
      </button>
    </div>
  );
}

export default ChatWidget;
