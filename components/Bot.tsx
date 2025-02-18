"use client";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Send } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm"; // Enables GitHub Flavored Markdown (tables, lists, etc.)
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

interface Message {
  content: string;
  role: string;
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

  const clearChat = () => {
    // localStorage.removeItem("aeris_chat");
    setMessages([]);
  };

  // useEffect(() => {
  //   if (typeof window !== "undefined") {
  //     // ✅ Ensure it's running on the client
  //     const storedMessages = JSON.parse(
  //       localStorage.getItem("aeris_chat") || "[]"
  //     );
  //     setMessages(storedMessages);
  //   }
  // }, []); // ✅ Runs only once

  // useEffect(() => {
  //   if (typeof window !== "undefined") {
  //     localStorage.setItem("aeris_chat", JSON.stringify(messages));
  //   }
  // }, [messages]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollIntoView({ behavior: "smooth" });
    }

    // localStorage.setItem("chatMessages", JSON.stringify(messages));
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!input.trim()) return;

    // const userMessage: Message = { role: "user", content: input };
    const newMessage = { content: text, role: "user" }; // add  timestamp: Date.now() if want to store time
    setMessages((prev) => [...prev, newMessage]);
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
        // console.log("Sending message:", JSON.stringify({ message: text }));

        const res = await fetch("/api/lm", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ message: text }), // Ensure message is included
        });

        if (!res.ok) {
          throw new Error(`API request failed: ${res.status}`);
        }

        const reader = res.body?.getReader();
        const decoder = new TextDecoder();
        if (!reader) throw new Error("No reader found in response body");

        if (reader) {
          let fullResponse = ""; // Store full response
          setMessages((prev) => [...prev, { role: "ai", content: "" }]);

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            fullResponse += chunk; // Accumulate full response

            // ✅ Update AI message while streaming
            setMessages((prev) =>
              prev.map((msg, index) =>
                index === prev.length - 1 && msg.role === "ai"
                  ? { ...msg, content: fullResponse }
                  : msg
              )
            );
          }

          // ✅ Final update to ensure full Markdown processing
          setMessages((prev) =>
            prev.map((msg, index) =>
              index === prev.length - 1 && msg.role === "ai"
                ? { ...msg, content: fullResponse.trim() } // Trim ensures proper Markdown parsing
                : msg
            )
          );
        }
      }
    } catch (error) {
      console.error("Error fetching AI response:", error);
      // console.error("Error sending message:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col w-full lg:max-w-[50vw] max-w-[100vw] mx-auto h-screen rounded py-4">
      <div
        ref={chatContainerRef}
        className="chat-container chat-window flex-1 overflow-y-auto space-y-2 p-4 mt-12 custom-scrollbar"
      >
        {messages.map((msg, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`chat-message mb-2 ${
              msg.role === "user" ? "text-right" : "text-left"
            }`}
          >
            <span
              className={`px-2 py-1 rounded-md inline-block ${
                msg.role === "user" ? "bg-gray-500 text-white" : ""
              }`}
            >
              <ReactMarkdown
                className="break-words whitespace-pre-wrap mx-auto"
                remarkPlugins={[remarkGfm]}
                components={{
                  code({ className, children, ...props }) {
                    const match = /language-(\w+)/.exec(className || "");
                    return match ? (
                      <SyntaxHighlighter
                        language={match[1]} // Dynamically detect the language
                        style={vscDarkPlus}
                        wrapLongLines={false} // Prevents wrapping
                        customStyle={{
                          maxWidth: "85vw", // Limit block size
                          overflow: "auto", // Enable scrolling inside block
                          borderRadius: "8px", // Optional: rounded corners
                          padding: "10px", // Spacing inside block
                          background: "#1e1e1e", // Optional: Ensure background color
                        }}
                        className="syntax-block"
                      >
                        {String(children).trim()}{" "}
                        {/* Fixing the 'code' issue */}
                      </SyntaxHighlighter>
                    ) : (
                      <code
                        className="bg-gray-700 text-white p-1 rounded"
                        {...props}
                      >
                        {children}
                      </code>
                    );
                  },
                }}
              >
                {msg.content.trim()}
              </ReactMarkdown>
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

      <div className="mb-12 flex items-center rounded-md border border-zinc-500 dark:border-gray-600 bg-transparent px-3 py-1 text-base shadow-sm transition-colors backdrop-blur-md backdrop-brightness-95 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-gray-500 dark:placeholder-gray-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-400 dark:focus-visible:ring-gray-500 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm">
        <button onClick={clearChat} className="clear-chat-btn">
          🗑
        </button>
        <input
          type="text"
          className="flex-1 p-2 bg-transparent outline-none text-lg"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault(); // Prevents unintended behaviors
              sendMessage(e.currentTarget.value); // Pass input value
              e.currentTarget.value = ""; // Clear input after sending
            }
          }}
          placeholder="Ask Aeris something..."
        />
        <button
          className="p-2  hover:text-gray-400 duration-200"
          onClick={() => sendMessage(input)} // Send the current input value
        disabled={loading || !input} // Disable if loading or no message
        >
          {loading ? "..." : <Send size={28} />}
        </button>
      </div>
    </div>
  );
}
