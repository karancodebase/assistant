"use client";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Send } from "lucide-react";
import ReactMarkdown from "react-markdown";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface SearchResult {
  title: string;
  link: string;
  snippet: string;
}

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [input, setInput] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = { role: "user", content: input };
    setMessages([...messages, userMessage]);
    setInput("");
    setLoading(true);

    try {
      if (input.startsWith("search:")) {
        // Google Custom Search
        const query = input.replace("search:", "").trim();
        console.log("Sending search request:", query);

        const res = await fetch("/api/search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query }),
        });

        const data = await res.json();
        console.log("Search API Response:", data);

        if (data.results) {
          setSearchResults(data.results); // Store search results separately
        }
      } else {
        // Gemini AI Chat
        const res = await fetch("/api/gemini", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: input }),
        });

        const data = await res.json();
        // console.log("Gemini API Response:", data);

        if (data.reply) {
          const botMessage: Message = {
            role: "assistant",
            content: data.reply,
          };
          setMessages((prev) => [...prev, botMessage]);
        }
      }
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col w-full lg:max-w-[50vw] max-w-[100vw] mx-auto lg:h-[95vh] h-screen rounded bg-gray-800 p-4">
      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto space-y-2 p-4 custom-scrollbar"
      >
        {messages.map((msg, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mb-2 ${
              msg.role === "user" ? "text-right" : "text-left"
            }`}
          >
            <span
              className={`px-3 py-1 rounded-md inline-block ${
                msg.role === "user"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 text-black"
              }`}
            >
              <ReactMarkdown>{msg.content}</ReactMarkdown>
            </span>
          </motion.div>
        ))}
      </div>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <div className="mt-4 border-t pt-2">
          <h3 className="text-lg font-semibold mb-2">Search Results:</h3>
          <ul>
            {searchResults.map((result, index) => (
              <li key={index} className="mb-2">
                <a
                  href={result.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 font-bold"
                >
                  {result.title}
                </a>
                <p className="text-sm text-gray-700">{result.snippet}</p>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex items-center p-2 bg-gray-600 shadow-md rounded-lg">
        <input
          type="text"
          className="flex-1 p-2 outline-none bg-gray-600 text-lg"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Google search..."
        />
        <button
          className="p-2 text-gray-100 hover:text-gray-400 duration-200"
          onClick={sendMessage}
          disabled={loading}
        >
          {loading ? "..." : <Send size={20} />}
        </button>
      </div>
    </div>
  );
}
