"use client";

import { useState } from "react";

interface Msg { role: "user" | "bot"; text: string; }

export default function Home() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Msg[]>([]);
  const [loading, setLoading] = useState(false);

  async function send() {
    const text = input.trim();
    if (!text || loading) return;
    setMessages((m) => [...m, { role: "user", text }]);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });
      const data = await res.json();
      setMessages((m) => [...m, { role: "bot", text: data.reply ?? "No response." }]);
    } catch {
      setMessages((m) => [...m, { role: "bot", text: "Error reaching the server." }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gray-100 flex flex-col items-center p-4">
      <div className="w-full max-w-xl flex flex-col h-[90vh] bg-white rounded-2xl shadow">
        <header className="p-4 border-b font-semibold text-lg">Campus Assistant</header>
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.length === 0 && (
            <p className="text-gray-400 text-sm">Ask me about your timetable, faculty, exams, clubs, or food on campus.</p>
          )}
          {messages.map((m, i) => (
            <div key={i} className={m.role === "user" ? "text-right" : "text-left"}>
              <span className={`inline-block px-3 py-2 rounded-2xl whitespace-pre-wrap ${m.role === "user" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-900"}`}>
                {m.text}
              </span>
            </div>
          ))}
          {loading && <p className="text-gray-400 text-sm">Thinking…</p>}
        </div>
        <div className="p-3 border-t flex gap-2">
          <input
            className="flex-1 border rounded-xl px-3 py-2 outline-none"
            value={input}
            placeholder="Type your question…"
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") send(); }}
          />
          <button onClick={send} disabled={loading} className="bg-blue-600 text-white px-4 py-2 rounded-xl disabled:opacity-50">
            Send
          </button>
        </div>
      </div>
    </main>
  );
}