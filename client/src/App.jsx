import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// GENERATE THREAD_ID FOR ASSISTANT MEMORY
const getThreadId = () => {
  let id = localStorage.getItem("thread_id");
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("thread_id", id);
  }
  return id;
};

const App = () => {
  const threadIdRef = useRef(getThreadId());
  const chatEndRef = useRef(null);

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const callServer = async (message) => {
    const response = await fetch(`http://localhost:3001/api/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message, thread_id: threadIdRef.current }),
    });

    const result = await response.json();
    return result.message;
  };

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = {
      role: "user",
      content: input,
    };

    setMessages((prevMessage) => [...prevMessage, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const assistantResponse = await callServer(input);

      setMessages((prevMessage) => [
        ...prevMessage,
        { role: "assistant", content: assistantResponse },
      ]);
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
    <div className="h-screen w-full bg-linear-to-br from-neutral-900 via-neutral-950 to-black text-white flex flex-col">
      {/* Header */}
      <header className="px-6 py-4 border-b border-white/10 backdrop-blur-md">
        <h1 className="text-2xl font-semibold tracking-tight">Nova</h1>
        <p className="text-xs text-neutral-400">Personal AI Assistant</p>
      </header>

      {/* Chat */}
      <main className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
        <AnimatePresence>
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className={`w-fit rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-lg ${
                msg.role === "user"
                  ? "ml-auto bg-indigo-600/90"
                  : "mr-auto bg-neutral-800/80"
              }`}
            >
              {msg.content}
            </motion.div>
          ))}
        </AnimatePresence>

        {loading && (
          <div className="text-sm text-neutral-400 animate-pulse">
            Nova is thinking…
          </div>
        )}
        <div ref={chatEndRef} />
      </main>

      {/* Input */}
      <footer className="p-4 border-t border-white/10 bg-black/40 backdrop-blur-md">
        <div className="flex items-end gap-3">
          <textarea
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={loading}
            placeholder="Ask Nova about your meetings…"
            className="flex-1 resize-none rounded-xl bg-neutral-900 border border-neutral-700 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            onClick={handleSendMessage}
            disabled={loading}
            className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-medium hover:bg-indigo-500 disabled:opacity-40"
          >
            Send
          </button>
        </div>
      </footer>
    </div>
  );
};

export default App;
