"use client";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { Input } from "./ui/input";
import { Button } from "./ui/button";

interface Message {
  content: string;
  role: string;
}


const Chat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  //   const clearChat = () => {
  //     setMessages([]);
  //   };

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!input.trim()) return;

    const newUserMessage = { content: text, role: "user" };
    setMessages((prev) => [...prev, newUserMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/gemini", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: text }),
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      if (!reader) throw new Error("No reader found in response body");

      if (reader) {
        let fullResponse = "";
        setMessages((prev) => [...prev, { role: "ai", content: "" }]);

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          fullResponse += chunk;

          setMessages((prev) =>
            prev.map((msg, index) =>
              index === prev.length - 1 && msg.role === "ai"
                ? { ...msg, content: fullResponse }
                : msg
            )
          );
        }

        setMessages((prev) =>
          prev.map((msg, index) =>
            index === prev.length - 1 && msg.role === "ai"
              ? { ...msg, content: fullResponse.trim() }
              : msg
          )
        );
      }
    } catch (error) {
      console.error("Error fetching AI response:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="flex flex-col w-full lg:max-w-[60vw] max-w-[90vw] mx-auto h-full min-h-[90vh] rounded py-4">
        <div className="flex-1 overflow-y-auto space-y-2 p-4 mt-12 custom-scrollbar">
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
                <ReactMarkdown>{msg.content}</ReactMarkdown>
              </span>
            </motion.div>
          ))}
          {loading && (
            <p className="text-gray-300 self-start">Aeris is thinking... 🤖</p>
          )}
        </div>

        <div className="flex px-4 w-[90vw] gap-2 lg:w-[40vw]">
          <Input
            type="text"
            className=""
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                sendMessage(e.currentTarget.value);
                e.currentTarget.value = "";
              }
            }}
            placeholder="Ask Aeris something..."
          />
          <Button
            className="z-50"
            onClick={() => sendMessage(input)}
            disabled={loading || !input}
          >
            {loading ? "..." : "Send"}
          </Button>
        </div>
      </div>
    </>
  );
};

export default Chat;
