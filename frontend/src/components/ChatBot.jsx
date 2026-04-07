"use client";
import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Bot, User } from "lucide-react";
import { useRouter } from "next/navigation";

// ── Service keyword map ──────────────────────────────────────────────────────
const SERVICE_MAP = [
  { keywords: ["clean", "sweep", "mop", "dust", "sanitiz", "hygiene", "dirt", "mess"], service: "Cleaning",   slug: "cleaning"   },
  { keywords: ["plumb", "pipe", "leak", "drain", "tap", "faucet", "water", "toilet", "sewage"], service: "Plumbing",   slug: "plumbing"   },
  { keywords: ["electric", "wiring", "wire", "socket", "switch", "circuit", "power", "light", "fan"], service: "Electrical", slug: "electrical" },
  { keywords: ["ac", "air condition", "cooling", "hvac", "refrigerant", "gas fill", "split"], service: "AC Repair",  slug: "ac-repair"  },
  { keywords: ["paint", "colour", "color", "wall", "brush", "wallpaper", "texture"], service: "Painting",    slug: "painting"   },
  { keywords: ["carpentr", "wood", "furniture", "cabinet", "door", "shelf", "wardrobe"], service: "Carpentry",   slug: "carpentry"  },
  { keywords: ["pest", "insect", "termite", "rodent", "cockroach", "mosquito", "bug"], service: "Pest Control", slug: "pest-control" },
  { keywords: ["garden", "lawn", "plant", "mow", "tree", "landscape"], service: "Gardening", slug: "gardening" },
  { keywords: ["move", "shift", "relocat", "pack", "transport"], service: "Moving & Shifting", slug: "moving-shifting" },
  { keywords: ["cctv", "camera", "security", "surveillance"], service: "CCTV & Security", slug: "cctv-security" },
  { keywords: ["handyman", "repair", "fix", "broken", "maintenance", "general", "help", "issue", "problem"], service: null, slug: null },
];

function detectService(text) {
  const lower = text.toLowerCase();
  for (const entry of SERVICE_MAP) {
    if (entry.keywords.some((kw) => lower.includes(kw))) return entry;
  }
  return null;
}

// ── Conversation flow ────────────────────────────────────────────────────────
const INITIAL_STATE = "idle";

function getBotReply(userMsg, state, setFlowState) {
  const trimmed = userMsg.trim().toLowerCase();

  if (state === "idle") {
    if (trimmed.length < 2) {
      return { text: "Hi there! 👋 I'm your HomeEase assistant. Tell me what service you need — cleaning, plumbing, electrical, AC repair, or anything else!", action: null };
    }
    const detected = detectService(userMsg);
    if (detected && detected.service) {
      setFlowState("service_detected");
      return {
        text: `Got it! It sounds like you need **${detected.service}** service. We have verified professionals ready to help! 🔧\n\nWould you like to see available vendors?`,
        action: { label: "Find Vendors →", href: `/services/${detected.slug}` },
        actionAlt: { label: "Browse All Services", href: "/services" },
      };
    }
    if (detected && !detected.service) {
      setFlowState("generic");
      return {
        text: "I can help with that! 🛠️ We offer a wide range of home services. Let me connect you with our service professionals.\n\nWould you like to browse all services?",
        action: { label: "Browse Services →", href: "/services" },
      };
    }
    setFlowState("clarify");
    return { text: "I'm not quite sure what you need. Could you give me a bit more detail? For example: *\"my AC is not cooling\"*, *\"pipe is leaking\"*, or *\"need house cleaning\"*.", action: null };
  }

  if (state === "clarify") {
    const detected = detectService(userMsg);
    if (detected && detected.service) {
      setFlowState("service_detected");
      return {
        text: `Perfect! **${detected.service}** — we're on it! 🎯 Click below to find verified vendors near you.`,
        action: { label: `Find ${detected.service} Vendors →`, href: `/services/${detected.slug}` },
      };
    }
    setFlowState("idle");
    return {
      text: "No worries! Let me take you to our full services page where you can browse everything we offer. 😊",
      action: { label: "Browse All Services →", href: "/services" },
    };
  }

  if (state === "service_detected" || state === "generic") {
    if (trimmed.includes("book") || trimmed.includes("yes") || trimmed.includes("sure") || trimmed.includes("ok")) {
      return {
        text: "Great! Head to your dashboard to book a service, or sign up if you're new. We'll match you with the best professionals! 🌟",
        action: { label: "Go to Dashboard →", href: "/login" },
      };
    }
    return {
      text: "Is there anything else I can help you with? You can ask me about any home service — plumbing, electrical, cleaning, AC, painting, and more!",
      action: null,
    };
  }

  return { text: "How can I help you today? Tell me what home service you're looking for! 🏠", action: null };
}

// ── ChatBot Component ────────────────────────────────────────────────────────
export default function ChatBot() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 0,
      from: "bot",
      text: "Hi! 👋 I'm your **HomeEase** assistant. What home service do you need today? (e.g., *cleaning*, *plumbing*, *AC repair*…)",
      action: null,
    },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [flowState, setFlowState] = useState(INITIAL_STATE);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (open && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, open, typing]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 100);
  }, [open]);

  const sendMessage = async (text) => {
    if (!text.trim()) return;
    const userMsg = { id: Date.now(), from: "user", text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setTyping(true);

    await new Promise((r) => setTimeout(r, 700 + Math.random() * 500));

    const reply = getBotReply(text, flowState, setFlowState);
    setTyping(false);
    setMessages((prev) => [...prev, { id: Date.now() + 1, from: "bot", ...reply }]);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  // Render bold markdown **text**
  const renderText = (text) =>
    text.split(/\*\*(.*?)\*\*/g).map((part, i) =>
      i % 2 === 1 ? <strong key={i}>{part}</strong> : part.split(/\*(.*?)\*/g).map((p, j) =>
        j % 2 === 1 ? <em key={j}>{p}</em> : p
      )
    );

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Toggle chat assistant"
        className="fixed bottom-6 right-6 z-[999] w-14 h-14 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 animate-pulse-ring"
      >
        {open ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
      </button>

      {/* Chat window */}
      <div
        className={`fixed bottom-24 right-6 z-[998] w-[340px] sm:w-[380px] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden transition-all duration-300 ${
          open ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 translate-y-4 pointer-events-none"
        }`}
        style={{ maxHeight: "520px" }}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 to-red-700 px-4 py-3 flex items-center gap-3">
          <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
            <Bot className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1">
            <p className="text-white font-semibold text-sm leading-tight">HomeEase Assistant</p>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
              <span className="text-red-100 text-xs">Online • Ready to help</span>
            </div>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="p-1 text-white/70 hover:text-white hover:bg-white/10 rounded-md transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-gray-50" style={{ minHeight: 0 }}>
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-2 ${msg.from === "user" ? "flex-row-reverse" : "flex-row"} animate-fade-in`}
            >
              <div className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold ${
                msg.from === "bot" ? "bg-red-600" : "bg-gray-700"
              }`}>
                {msg.from === "bot" ? <Bot className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
              </div>
              <div className={`flex flex-col gap-1.5 max-w-[80%] ${msg.from === "user" ? "items-end" : "items-start"}`}>
                <div className={`px-3 py-2 rounded-xl text-sm leading-relaxed ${
                  msg.from === "bot"
                    ? "bg-white text-gray-800 border border-gray-200 rounded-tl-none shadow-sm"
                    : "bg-red-600 text-white rounded-tr-none"
                }`}>
                  {renderText(msg.text)}
                </div>
                {msg.action && (
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      onClick={() => { router.push(msg.action.href); setOpen(false); }}
                      className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs font-semibold hover:bg-red-700 transition-colors"
                    >
                      {msg.action.label}
                    </button>
                    {msg.actionAlt && (
                      <button
                        onClick={() => { router.push(msg.actionAlt.href); setOpen(false); }}
                        className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-xs font-semibold hover:bg-gray-200 transition-colors"
                      >
                        {msg.actionAlt.label}
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {typing && (
            <div className="flex gap-2">
              <div className="w-7 h-7 rounded-full bg-red-600 flex items-center justify-center">
                <Bot className="w-3.5 h-3.5 text-white" />
              </div>
              <div className="px-3 py-2.5 bg-white border border-gray-200 rounded-xl rounded-tl-none shadow-sm flex items-center gap-1">
                <span className="typing-dot w-1.5 h-1.5 bg-gray-400 rounded-full block" />
                <span className="typing-dot w-1.5 h-1.5 bg-gray-400 rounded-full block" />
                <span className="typing-dot w-1.5 h-1.5 bg-gray-400 rounded-full block" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick suggestions */}
        <div className="px-3 pt-2 pb-1 bg-white border-t border-gray-100">
          <div className="flex gap-1.5 flex-wrap">
            {["Cleaning", "Plumbing", "AC Repair", "Electrical"].map((s) => (
              <button
                key={s}
                onClick={() => sendMessage(`I need ${s}`)}
                className="px-2.5 py-1 bg-red-50 text-red-600 rounded-full text-xs font-medium hover:bg-red-100 transition-colors border border-red-100"
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Input */}
        <div className="px-3 pb-3 pt-1.5 bg-white flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask me anything…"
            className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent bg-gray-50"
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={!input.trim()}
            className="w-9 h-9 bg-red-600 text-white rounded-xl flex items-center justify-center hover:bg-red-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </>
  );
}
