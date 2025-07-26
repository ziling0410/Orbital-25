import React, { useRef, useState, useEffect } from "react";
import "./chat.css";

function ChatWidget({
  users = [{ id: "u1", label: "User1" }, { id: "u2", label: "User2" }],
  defaultUserId = "u1",
  storageKey = "chat_widget_messages",
  header = "Chat"
}) {
  const [input, setInput] = useState("");
  const [currentUserId, setCurrentUserId] = useState(defaultUserId);
  const [messages, setMessages] = useState([]);
  const messagesEl = useRef(null);

  // Map of userId to index (for alternating message alignment/colors)
  const userIndexMap = Object.fromEntries(users.map((u, idx) => [u.id, idx]));

  // Load messages from localStorage on mount or storageKey change
  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(storageKey)) || [];
      setMessages(stored);
    } catch {
      setMessages([]);
    }
  }, [storageKey]);

  // Auto-scroll on message
  useEffect(() => {
    if (messagesEl.current) {
      messagesEl.current.scrollTop = messagesEl.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    const next = [...messages, { userId: currentUserId, text: input.trim() }];
    setMessages(next);
    localStorage.setItem(storageKey, JSON.stringify(next));
    setInput("");
  };

  const handleClear = () => {
    setMessages([]);
    localStorage.removeItem(storageKey);
  };

  return (
    <div className="chat-widget">
      <div className="chat-widget__selector">
        {users.map((u) => (
          <button
            key={u.id}
            data-user={u.id}
            className={
              "chat-widget__selector-btn" +
              (currentUserId === u.id ? " active" : "")
            }
            onClick={() => setCurrentUserId(u.id)}
          >
            {u.label}
          </button>
        ))}
      </div>
      <div className="chat-widget__header">{header}</div>
      <div className="chat-widget__messages" ref={messagesEl}>
        {messages.map((msg, i) => {
          // Pick left/right styling by user index (alternating)
          const userIdx = userIndexMap[msg.userId] ?? 0;
          const direction = userIdx % 2 === 0 ? "out" : "in";
          // Choose user label
          const label = users.find((u) => u.id === msg.userId)?.label || msg.userId;
          return (
            <div
              key={i}
              className={`chat-widget__message chat-widget__message--${direction}`}
            >
              {label}: {msg.text}
            </div>
          );
        })}
      </div>
      <form className="chat-widget__form" autoComplete="off" onSubmit={handleSend}>
        <input
          className="chat-widget__input"
          type="text"
          value={input}
          placeholder="Type a message..."
          onChange={e => setInput(e.target.value)}
        />
        <button className="chat-widget__btn" type="submit">
          Send
        </button>
      </form>
      <button className="chat-widget__clear" type="button" onClick={handleClear}>
        Clear Chat
      </button>
    </div>
  );
}

export default ChatWidget;