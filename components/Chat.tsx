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
    setMessages((prev) => [...prev, userMessage]);
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

        if (!res.ok) {
          throw new Error("Failed to get response");
        }
        const reader = res.body?.getReader();
        const decoder = new TextDecoder();
        let aiMessage = "";

        setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

        if (reader) {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            aiMessage += decoder.decode(value, { stream: true });

            setMessages((prev) =>
              prev.map((msg, index) =>
                index === prev.length - 1 && msg.role === "assistant"
                  ? { ...msg, content: aiMessage }
                  : msg
              )
            );
          }
        }
        
        // if (!res.ok) {
        //   const errorData = await res.json();
        //   throw new Error(errorData.error || "Unknown error");
        // }

        // const data = await res.json();
        // const aiMessage: Message = { role: "assistant", content: data.reply };

        // setMessages((prev) => [...prev, aiMessage]);
        // setResponse(data.reply);

        // const data = await res.json();
        // console.log("Gemini API Response:", data);

        // if (!data.reply) {
        //   setResponse("Server is down, please try again later.");
        //   setLoading(false);
        //   return;
        // }

        // const reader = res.body.getReader();
        // const decoder = new TextDecoder();
        // let aiMessage = "";

        // while (true) {
        //   const { value, done } = await reader.read();
        //   if (done) break;

        //   fullResponse += decoder.decode(value);
        //   setResponse(fullResponse); // Update UI dynamically
        // }

        // setLoading(false);

        // if (data.reply) {
        //   const botMessage: Message = {
        //     role: "assistant",
        //     content: data.reply,
        //   };
        //   setMessages((prev) => [...prev, botMessage]);
        // }
      }
    } catch (error) {
      console.error("Error fetching AI response:", error);
      // console.error("Error sending message:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col w-full lg:max-w-[50vw] max-w-[100vw] mx-auto h-screen rounded bg-gray-800 p-4">
      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto space-y-2 p-4 mt-12 custom-scrollbar"
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
                  ? "bg-gray-500 text-white"
                  : ""
              }`}
            >
              <ReactMarkdown>{msg.content}</ReactMarkdown>
            </span>
          </motion.div>
        ))}
        {loading && (
          <p className="text-gray-300 self-start">Aeris is thinking... 🤖</p>
        )}
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

      <div className="mb-12 flex items-center p-2 bg-gray-600 shadow-md rounded-lg">
        <input
          type="text"
          className="flex-1 p-2 outline-none bg-gray-600 text-white text-lg"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Ask Aeris something..."
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
