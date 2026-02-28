"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Send, Loader2, MessageCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Message {
  id:         string;
  jobId:      string | null;
  senderId:   string;
  senderName: string | null;
  senderRole: string;
  body:       string;
  readAt:     string | null;
  createdAt:  string;
}

interface Props {
  jobId:         string;
  jobTitle:      string;
  currentUserId: string;
  currentRole:   string;
}

export default function MessageThread({ jobId, jobTitle, currentUserId, currentRole }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [body, setBody]         = useState("");
  const [loading, setLoading]   = useState(true);
  const [sending, setSending]   = useState(false);
  const bottomRef               = useRef<HTMLDivElement>(null);

  const fetchMessages = useCallback(async () => {
    try {
      const res = await fetch(`/api/messages?jobId=${jobId}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      }
    } finally {
      setLoading(false);
    }
  }, [jobId]);

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 15_000); // poll every 15s
    return () => clearInterval(interval);
  }, [fetchMessages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim() || sending) return;
    setSending(true);
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId, body }),
      });
      if (res.ok) {
        const msg: Message = await res.json();
        setMessages((prev) => [...prev, msg]);
        setBody("");
      }
    } finally {
      setSending(false);
    }
  }

  function formatTime(iso: string) {
    const d = new Date(iso);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" }) +
      " · " + d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  }

  const isMine = (msg: Message) => msg.senderId === currentUserId;

  return (
    <div className="flex flex-col rounded-xl overflow-hidden" style={{ border: "1px solid rgba(0,0,0,0.08)", minHeight: 320 }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b">
        <div className="flex items-center gap-2">
          <MessageCircle className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold">Messages · {jobTitle}</h3>
        </div>
        <button onClick={fetchMessages} className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded">
          <RefreshCw className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-muted/20" style={{ maxHeight: 320 }}>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-muted-foreground">No messages yet. Start the conversation.</p>
          </div>
        ) : (
          messages.map((msg) => {
            const mine = isMine(msg);
            return (
              <div key={msg.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 shadow-sm ${
                  mine
                    ? "bg-primary text-primary-foreground rounded-br-sm"
                    : "bg-background border rounded-bl-sm"
                }`}>
                  {!mine && (
                    <p className="text-xs font-semibold mb-1 opacity-70">
                      {msg.senderName ?? msg.senderRole}
                      {msg.senderRole === "ADMIN" && (
                        <span className="ml-1.5 text-[10px] font-bold uppercase tracking-wide opacity-60">Ops</span>
                      )}
                    </p>
                  )}
                  <p className="text-sm leading-relaxed">{msg.body}</p>
                  <p className={`text-[10px] mt-1 ${mine ? "text-primary-foreground/60" : "text-muted-foreground"}`}>
                    {formatTime(msg.createdAt)}
                    {mine && msg.readAt && <span className="ml-1.5">· Read</span>}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={sendMessage} className="flex items-end gap-2 p-3 border-t bg-background">
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(e as unknown as React.FormEvent); } }}
          placeholder="Type a message…"
          rows={1}
          className="flex-1 resize-none rounded-xl border bg-muted/30 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
          style={{ maxHeight: 120, overflowY: "auto" }}
        />
        <Button type="submit" size="icon" disabled={!body.trim() || sending} className="rounded-xl h-9 w-9 shrink-0">
          {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </Button>
      </form>
    </div>
  );
}
