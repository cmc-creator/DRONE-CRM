"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { MessageCircle, X, Send, Loader2, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const WELCOME: Message = {
  role: "assistant",
  content: "Hi! I'm the Lumin Aerial AI assistant. Ask me anything about drone operations, your projects, FAA regs, or anything else I can help with!",
};

export function ChatWidget() {
  const [open, setOpen]           = useState(false);
  const [messages, setMessages]   = useState<Message[]>([WELCOME]);
  const [input, setInput]         = useState("");
  const [loading, setLoading]     = useState(false);
  const [disabled, setDisabled]   = useState(false);
  const [error, setError]         = useState("");
  const bottomRef                 = useRef<HTMLDivElement>(null);
  const inputRef                  = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 80);
    }
  }, [open]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = useCallback(async () => {
    const text = input.trim();
    if (!text || loading || disabled) return;
    setInput("");
    setError("");

    const updated: Message[] = [...messages, { role: "user", content: text }];
    setMessages(updated);
    setLoading(true);

    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: updated }),
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
              "The AI assistant isn't enabled yet. Contact Bailey at bsargent@luminaerial.com to set it up!",
          },
        ]);
      } else {
        setError(data.error ?? "Something went wrong. Please try again.");
      }
      return;
    }

    setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
  }, [input, loading, disabled, messages]);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "fixed bottom-5 right-5 z-50 w-13 h-13 rounded-full shadow-lg flex items-center justify-center transition-all duration-200",
          "bg-blue-600 hover:bg-blue-700 text-white",
          open && "rotate-90"
        )}
        style={{ width: 52, height: 52 }}
        aria-label="Toggle AI assistant"
      >
        {open ? <X className="h-5 w-5" /> : <MessageCircle className="h-5 w-5" />}
      </button>

      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-[72px] right-5 z-50 w-[350px] max-h-[520px] flex flex-col rounded-2xl shadow-2xl border bg-background overflow-hidden">
          {/* Header */}
          <div className="bg-blue-600 text-white px-4 py-3 flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
              <Bot className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-semibold">Lumin Aerial AI</p>
              <p className="text-[10px] text-blue-100">Drone ops assistant</p>
            </div>
            <button className="ml-auto text-white/70 hover:text-white" onClick={() => setOpen(false)}>
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2 bg-muted/20 min-h-[300px] max-h-[380px]">
            {messages.map((msg, i) => (
              <div key={i} className={cn("flex", msg.role === "user" ? "justify-end" : "justify-start")}>
                <div
                  className={cn(
                    "rounded-2xl px-3 py-2 text-sm max-w-[82%] leading-relaxed",
                    msg.role === "user"
                      ? "bg-blue-600 text-white rounded-br-sm"
                      : "bg-background border text-foreground rounded-bl-sm shadow-sm"
                  )}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-background border rounded-2xl rounded-bl-sm px-3 py-2 flex items-center gap-1.5 shadow-sm">
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Thinking…</span>
                </div>
              </div>
            )}
            {error && (
              <div className="text-xs text-red-500 text-center px-2">{error}</div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="border-t bg-background px-3 py-3 flex items-center gap-2">
            <input
              ref={inputRef}
              className="flex-1 text-sm bg-muted/40 border rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              placeholder={disabled ? "AI not configured" : "Ask anything…"}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading || disabled}
            />
            <Button
              size="icon"
              className="rounded-xl h-9 w-9 bg-blue-600 hover:bg-blue-700"
              onClick={sendMessage}
              disabled={!input.trim() || loading || disabled}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
