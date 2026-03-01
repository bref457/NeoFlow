"use client";

import { useState, useRef, useEffect } from "react";
import { Bot, Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type Message = {
  role: "user" | "aria";
  content: string;
  ts?: string;
};

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadHistory() {
      try {
        const res = await fetch("/api/aria/history");
        const data = await res.json();
        const entries: Message[] = (data.history ?? []).slice(-20).map((h: { role: string; content: string; ts?: string }) => ({
          role: h.role === "user" ? "user" : "aria",
          content: h.content,
          ts: h.ts,
        }));
        setMessages(entries);
      } catch {
        // History nicht verfügbar, leer starten
      } finally {
        setHistoryLoading(false);
      }
    }
    loadHistory();
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, historyLoading]);

  async function send() {
    const msg = input.trim();
    if (!msg || loading) return;

    setMessages((prev) => [...prev, { role: "user", content: msg }]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/aria/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: msg }),
      });
      const data = await res.json();
      setMessages((prev) => [...prev, { role: "aria", content: data.response ?? "Keine Antwort." }]);
    } catch {
      setMessages((prev) => [...prev, { role: "aria", content: "Verbindungsfehler zu ARIA." }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col" style={{ height: "calc(100vh - 10rem)" }}>
      <div className="mb-4 space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">ARIA Chat</h1>
        <p className="text-sm text-muted-foreground">Geteiltes Gedächtnis mit Telegram.</p>
      </div>

      <div className="flex-1 overflow-y-auto rounded-xl border border-border/60 bg-card/30 p-4">
        {historyLoading ? (
          <div className="flex h-full items-center justify-center">
            <Loader2 className="size-5 animate-spin text-aria" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <div className="space-y-3 text-center">
              <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-aria-dim">
                <Bot className="size-6 text-aria" />
              </div>
              <p className="text-sm text-muted-foreground">Schreib ARIA etwas…</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {messages.map((msg, i) => (
              <div key={i} className={cn("flex flex-col gap-1", msg.role === "user" ? "items-end" : "items-start")}>
                <div
                  className={cn(
                    "max-w-[80%] rounded-2xl px-4 py-2.5 text-sm",
                    msg.role === "user"
                      ? "bg-aria text-black"
                      : "border border-border/60 bg-card text-foreground"
                  )}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                </div>
                {msg.ts && (
                  <span className="px-1 text-[10px] text-muted-foreground">{msg.ts}</span>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="rounded-2xl border border-border/60 bg-card px-4 py-3">
                  <Loader2 className="size-4 animate-spin text-aria" />
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>
        )}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send();
        }}
        className="mt-3 flex gap-2"
      >
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Nachricht an ARIA…"
          disabled={loading || historyLoading}
          className="flex-1"
        />
        <Button type="submit" disabled={loading || historyLoading || !input.trim()} size="icon">
          <Send className="size-4" />
        </Button>
      </form>
    </div>
  );
}
