"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { X, Send, Loader2, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const ADMIN_WELCOME: Message = {
  role: "assistant",
  content:
    "Hi BoBo! I'm Volo, your personal drone ops co-pilot. What can we conquer today?",
};

const GUEST_WELCOME: Message = {
  role: "assistant",
  content:
    "Hi! I'm Volo, the Lumin Aerial assistant. Ask me about your jobs, invoices, or anything drone-related.",
};

const ADMIN_PROMPTS = [
  "What needs my attention today?",
  "Jobs needing pilots?",
  "Any overdue invoices?",
  "Leads to follow up on?",
  "Help me write a client proposal",
  "Revenue this month",
  "Any pilot certs expiring?",
  "Remind me my mom loves me",
];

interface Props {
  isAdmin?: boolean;
}

export function ChatWidget({ isAdmin = false }: Props) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    isAdmin ? ADMIN_WELCOME : GUEST_WELCOME,
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [error, setError] = useState("");
  const [promptsVisible, setPromptsVisible] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 80);
  }, [open]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = useCallback(
    async (text?: string) => {
      const content = (text ?? input).trim();
      if (!content || loading || disabled) return;
      setInput("");
      setError("");
      setPromptsVisible(false);

      const updated: Message[] = [...messages, { role: "user", content }];
      setMessages(updated);
      setLoading(true);

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: updated, isAdmin }),
      });

      const data = await res.json();
      setLoading(false);

      if (!res.ok) {
        if (data.code === "NO_API_KEY") {
          setDisabled(true);
          setMessages((prev) => [
            ...prev,
            {
              role: "assistant",
              content:
                "Volo isn't enabled yet -- Bailey needs to add the OpenAI API key to get me flying.",
            },
          ]);
        } else {
          setError(data.error ?? "Something went wrong. Try again.");
        }
        return;
      }

      setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
    },
    [input, loading, disabled, messages, isAdmin]
  );

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  const panelBg = "#070f1a";
  const borderColor = "rgba(0,212,255,0.15)";

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-5 right-5 z-50 rounded-full shadow-lg flex items-center justify-center transition-all duration-300"
        style={{
          width: 52,
          height: 52,
          background: open
            ? "rgba(0,212,255,0.15)"
            : "linear-gradient(135deg,rgba(0,212,255,0.9),rgba(0,150,200,0.9))",
          border: "1px solid rgba(0,212,255,0.5)",
          boxShadow: "0 0 20px rgba(0,212,255,0.3), 0 4px 20px rgba(0,0,0,0.5)",
          transform: open ? "rotate(90deg)" : "rotate(0deg)",
        }}
        aria-label="Toggle Volo assistant"
      >
        {open ? (
          <X className="h-5 w-5" style={{ color: "#00d4ff" }} />
        ) : (
          <Zap className="h-5 w-5 text-white" fill="white" />
        )}
      </button>

      {/* Chat panel */}
      {open && (
        <div
          className="fixed bottom-[72px] right-5 z-50 w-[360px] flex flex-col rounded-2xl shadow-2xl overflow-hidden"
          style={{
            background: panelBg,
            border: `1px solid ${borderColor}`,
            boxShadow:
              "0 0 40px rgba(0,212,255,0.08), 0 20px 60px rgba(0,0,0,0.8)",
            maxHeight: 560,
          }}
        >
          {/* Header */}
          <div
            className="px-4 py-3 flex items-center gap-3"
            style={{
              background: "rgba(0,212,255,0.05)",
              borderBottom: "1px solid rgba(0,212,255,0.12)",
            }}
          >
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{
                background: "linear-gradient(135deg,rgba(0,212,255,0.2),rgba(0,100,180,0.2))",
                border: "1px solid rgba(0,212,255,0.3)",
                boxShadow: "0 0 12px rgba(0,212,255,0.15)",
              }}
            >
              <Zap className="h-4 w-4" style={{ color: "#00d4ff" }} fill="rgba(0,212,255,0.4)" />
            </div>
            <div className="flex-1 min-w-0">
              <p
                className="text-sm font-black tracking-widest uppercase"
                style={{
                  background: "linear-gradient(90deg,#00d4ff,#7c3aed)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Volo
              </p>
              <p className="text-[10px]" style={{ color: "rgba(0,212,255,0.45)" }}>
                {isAdmin ? "Your personal co-pilot" : "Lumin Aerial assistant"}
              </p>
            </div>
            <div className="flex items-center gap-1.5">
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: "#34d399", boxShadow: "0 0 6px #34d399" }}
              />
              <span className="text-[10px]" style={{ color: "rgba(52,211,153,0.7)" }}>
                Online
              </span>
            </div>
            <button
              className="ml-2 transition-colors"
              style={{ color: "rgba(0,212,255,0.4)" }}
              onClick={() => setOpen(false)}
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Messages */}
          <div
            className="flex-1 overflow-y-auto px-3 py-3 space-y-3"
            style={{
              background: "rgba(0,0,0,0.2)",
              minHeight: 280,
              maxHeight: 380,
            }}
          >
            {messages.map((msg, i) => (
              <div
                key={i}
                className={cn("flex", msg.role === "user" ? "justify-end" : "justify-start")}
              >
                {msg.role === "assistant" && (
                  <div
                    className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 mr-2 mt-0.5"
                    style={{
                      background: "rgba(0,212,255,0.1)",
                      border: "1px solid rgba(0,212,255,0.2)",
                    }}
                  >
                    <Zap
                      className="h-3 w-3"
                      style={{ color: "#00d4ff" }}
                      fill="rgba(0,212,255,0.3)"
                    />
                  </div>
                )}
                <div
                  className="rounded-2xl px-3 py-2 text-sm max-w-[78%] leading-relaxed"
                  style={
                    msg.role === "user"
                      ? {
                          background: "rgba(0,212,255,0.1)",
                          border: "1px solid rgba(0,212,255,0.2)",
                          color: "#d8e8f4",
                          borderBottomRightRadius: 4,
                        }
                      : {
                          background: "rgba(255,255,255,0.04)",
                          border: "1px solid rgba(0,212,255,0.08)",
                          color: "#c8ddf0",
                          borderBottomLeftRadius: 4,
                        }
                  }
                >
                  {msg.content}
                </div>
              </div>
            ))}

            {/* Suggested prompts — admin only, shown until user sends first message */}
            {isAdmin && promptsVisible && messages.length <= 1 && (
              <div className="space-y-1.5 pt-1">
                <p
                  className="text-[10px] uppercase tracking-wider font-bold px-1"
                  style={{ color: "rgba(0,212,255,0.35)" }}
                >
                  Quick prompts
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {ADMIN_PROMPTS.map((p) => (
                    <button
                      key={p}
                      onClick={() => sendMessage(p)}
                      disabled={loading || disabled}
                      className="text-[11px] px-2.5 py-1 rounded-full transition-all hover:border-cyan-400/50 hover:bg-cyan-400/10"
                      style={{
                        background: "rgba(0,212,255,0.05)",
                        border: "1px solid rgba(0,212,255,0.2)",
                        color: "rgba(0,212,255,0.7)",
                        cursor: "pointer",
                      }}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {loading && (
              <div className="flex justify-start items-center gap-2">
                <div
                  className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{
                    background: "rgba(0,212,255,0.1)",
                    border: "1px solid rgba(0,212,255,0.2)",
                  }}
                >
                  <Zap
                    className="h-3 w-3"
                    style={{ color: "#00d4ff" }}
                    fill="rgba(0,212,255,0.3)"
                  />
                </div>
                <div
                  className="rounded-2xl rounded-bl-sm px-3 py-2 flex items-center gap-2"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(0,212,255,0.08)",
                  }}
                >
                  <Loader2
                    className="h-3 w-3 animate-spin"
                    style={{ color: "#00d4ff" }}
                  />
                  <span className="text-xs" style={{ color: "rgba(0,212,255,0.5)" }}>
                    Volo is thinking...
                  </span>
                </div>
              </div>
            )}

            {error && (
              <div
                className="text-xs text-center px-3 py-2 rounded-lg"
                style={{ background: "rgba(248,113,113,0.1)", color: "#f87171" }}
              >
                {error}
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div
            className="px-3 py-3 flex items-center gap-2"
            style={{
              borderTop: "1px solid rgba(0,212,255,0.1)",
              background: "rgba(0,0,0,0.3)",
            }}
          >
            <input
              ref={inputRef}
              className="flex-1 text-sm rounded-xl px-3 py-2 focus:outline-none disabled:opacity-40 transition-all"
              style={{
                background: "rgba(0,212,255,0.05)",
                border: "1px solid rgba(0,212,255,0.15)",
                color: "#d8e8f4",
              }}
              placeholder={
                disabled
                  ? "Volo not configured"
                  : isAdmin
                  ? "Ask Volo anything..."
                  : "Ask a question..."
              }
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading || disabled}
            />
            <button
              className="rounded-xl h-9 w-9 flex items-center justify-center transition-all flex-shrink-0"
              style={{
                background:
                  !input.trim() || loading || disabled
                    ? "rgba(0,212,255,0.05)"
                    : "linear-gradient(135deg,rgba(0,212,255,0.8),rgba(0,150,200,0.8))",
                border: "1px solid rgba(0,212,255,0.25)",
                cursor: !input.trim() || loading || disabled ? "not-allowed" : "pointer",
              }}
              onClick={() => sendMessage()}
              disabled={!input.trim() || loading || disabled}
            >
              <Send
                className="h-4 w-4"
                style={{
                  color:
                    !input.trim() || loading || disabled ? "rgba(0,212,255,0.3)" : "#04080f",
                }}
              />
            </button>
          </div>
        </div>
      )}
    </>
  );
}