import React, { useEffect, useRef, useState } from "react";

const App = () => {
  const chatEndRef = useRef(null);

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSendMessage = () => {
    if (!input.trim()) return;

    const userMessage = {
      role: "user",
      content: input,
    };

    setMessages((prevMessage) => [...prevMessage, userMessage]);
    setInput("");
    setLoading(true);

    try {
      // Logic for API Call
    } catch (error) {
      console.error("Error while send message", error);
      setMessages((prevMessage) => [
        ...prevMessage,
        {
          role: "assistant",
          content: "Something went wrong, Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Auto scroll
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  return (
    <div className="bg-neutral-900 text-white h-screen flex flex-col">
      {/* HEADER */}
      <header className="border-b border-neutral-800 px-4 py-3">
        <h1 className="text-xl font-semibold">Nova</h1>
      </header>
      {/* CHAT SECTION */}
      <main className="flex-1 overflow-y-auto px-4 py-6">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`mb-4 max-w-fit p-4 rounded-2xl text-sm bg-neutral-800 ${
              msg.role === "user" ? "ml-auto" : ""
            }`}
          >
            <div className="prose prose-invert max-w-none">{msg.content}</div>
          </div>
        ))}

        {loading && (
          <div className="animate-pulse text-sm text-neutral-400">
            Thinking...
          </div>
        )}

        <div ref={chatEndRef} />
      </main>

      {/* INPUT */}
      <footer className="border-t border-neutral-800 p-4">
        <div className="flex gap-3">
          <textarea
            rows={"1"}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={loading}
            placeholder="Ask anything..."
            className="flex-1 resize-none bg-neutral-800 p-3 rounded-xl border border-neutral-700"
          />
          <button
            disabled={loading}
            onClick={handleSendMessage}
            className="bg-neutral-800 px-5 py-3 rounded-xl disabled:opacity-40"
          >
            Ask
          </button>
        </div>
      </footer>
    </div>
  );
};

export default App;
