import { Send, Mic, XCircle } from "lucide-react";
import { motion } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import "regenerator-runtime/runtime";
import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition";

import logo from "../../assets/logo.png";

// Extract userId from JWT token stored in localStorage
function getAuthUserId() {
  try {
    const token = localStorage.getItem("nf_token");
    if (!token) return "sandbox";
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.id || payload._id || payload.userId || "sandbox";
  } catch {
    return "sandbox";
  }
}

export function ChatPanel() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition
  } = useSpeechRecognition();

  // Sync mic with input
  useEffect(() => {
    if (transcript) setInput(transcript);
  }, [transcript]);

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  // SEND
  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const text = input.trim();

    const userMsg = {
      type: "user",
      content: text,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:7001/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: getAuthUserId(),
          message: text
        })
      });

      const data = await res.json();
      let reply = data?.reply || "⚠️ No response received.";

      // Convert object → string to prevent React crash
      if (typeof reply !== "string") {
        reply = JSON.stringify(reply, null, 2);
      }

      const botMsg = {
        type: "assistant",
        content: reply,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      };

      setMessages((prev) => [...prev, botMsg]);

    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          type: "assistant",
          content: "❌ Unable to reach NeuroFin server.",
          isError: true,
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        }
      ]);
    }

    setLoading(false);
  };

  return (
    <div className="flex flex-col h-full relative">
      
      {/* CONTENT */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 pb-32 custom-scrollbar">
        <div className="max-w-3xl mx-auto space-y-8">

          {/* HEADER */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center pt-8 pb-4"
          >
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4">
              <img src={logo} className="w-10 h-10" alt="NeuroFin" />
            </div>
            <h2 className="text-xl font-medium text-white mb-1">NeuroFin Assistant</h2>
            <p className="text-xs text-gray-400">Ask anything about your finances</p>
          </motion.div>

          {/* MESSAGES */}
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.type === "user" ? "justify-end" : "justify-start"}`}
            >
              <div className="max-w-[80%]">
                <div
                  className={`rounded-2xl px-5 py-3.5 text-sm whitespace-pre-line flex items-start gap-2 ${
                    msg.type === "user"
                      ? "bg-[#3BF7FF] text-black font-medium rounded-br-sm"
                      : "bg-[#1A1A1E] border border-white/5 text-gray-200 rounded-bl-sm"
                  }`}
                >
                  {msg.isError && <XCircle className="w-4 h-4 text-red-400" />}
                  <span>{msg.content}</span>
                </div>

                <p
                  className={`text-[10px] text-gray-600 mt-2 ${
                    msg.type === "user" ? "text-right" : "text-left"
                  }`}
                >
                  {msg.time}
                </p>
              </div>
            </motion.div>
          ))}

          {/* TYPING */}
          {loading && (
            <motion.div className="flex gap-1 pl-2">
              <div className="w-2 h-2 bg-white/20 rounded-full animate-bounce" />
              <div className="w-2 h-2 bg-white/20 rounded-full animate-bounce" style={{ animationDelay: ".2s" }} />
              <div className="w-2 h-2 bg-white/20 rounded-full animate-bounce" style={{ animationDelay: ".4s" }} />
            </motion.div>
          )}
        </div>
      </div>

      {/* INPUT BAR */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#00010D] pt-10 pb-6 px-4">
        <div className="max-w-3xl mx-auto">

          {/* SUGGESTIONS */}
          <div className="flex gap-2 mb-4 overflow-x-auto no-scrollbar">
            {[
              "Show investment opportunities",
              "Analyze savings rate",
              "What is my forecast?",
              "Give me a risk report"
            ].map((s, i) => (
              <button
                key={i}
                className="px-4 py-2 rounded-full bg-[#1A1A1E] border border-white/10 text-xs text-gray-400 hover:text-white"
                onClick={() => setInput(s)}
              >
                {s}
              </button>
            ))}
          </div>

          {/* INPUT */}
          <form onSubmit={handleSend}>
            <div className="relative bg-[#0A0A10] border border-white/10 rounded-2xl flex items-center p-2 pl-4">
              
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask anything about your finances..."
                className="flex-1 bg-transparent outline-none text-sm text-white h-10"
              />

              {/* MIC */}
              {browserSupportsSpeechRecognition && (
                <button
                  type="button"
                  className={`p-2 ${listening ? "text-red-500 animate-pulse" : "text-gray-500"}`}
                  onClick={() => {
                    if (listening) SpeechRecognition.stopListening();
                    else {
                      resetTranscript();
                      SpeechRecognition.startListening({
                        continuous: true,
                        language: "en-IN",
                      });
                    }
                  }}
                >
                  <Mic className="w-5 h-5" />
                </button>
              )}

              {/* SEND */}
              <button
                type="submit"
                className="p-2 bg-[#3BF7FF] text-black rounded-xl hover:bg-[#3BF7FF]/90"
              >
                <Send className="w-4 h-4" />
              </button>

            </div>
          </form>

          <p className="text-center text-[10px] text-gray-700 mt-3">
            NeuroFin can make mistakes. Please verify important information.
          </p>

        </div>
      </div>
    </div>
  );
}
