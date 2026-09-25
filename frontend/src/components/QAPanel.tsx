"use client";

import { useState } from "react";
import { askQuestion } from "@/lib/api";

interface ChatMessage {
  role: "user" | "assistant";
  text: string;
}

export default function QAPanel({ projectId }: { projectId: string }) {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [asking, setAsking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleAsk(e: React.FormEvent) {
    e.preventDefault();
    const q = question.trim();
    if (!q || asking) return;
    setMessages((m) => [...m, { role: "user", text: q }]);
    setQuestion("");
    setAsking(true);
    setError(null);
    try {
      const answer = await askQuestion(q, projectId);
      setMessages((m) => [...m, { role: "assistant", text: answer }]);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setAsking(false);
    }
  }

  return (
    <div className="flex flex-col rounded-lg border border-slate-200">
      <div className="border-b border-slate-200 px-4 py-3">
        <h3 className="text-sm font-semibold text-slate-900">Ask CyberManAIger</h3>
        <p className="text-xs text-slate-500">
          Ask about what&apos;s required and why — answers cite the policy directly.
        </p>
      </div>

      <div className="flex max-h-96 flex-1 flex-col gap-3 overflow-y-auto px-4 py-4">
        {messages.length === 0 && (
          <p className="text-xs text-slate-400">
            Try: &quot;Why do I need a manual pentest if I already ran an automated one?&quot;
          </p>
        )}
        {messages.map((m, i) => (
          <div
            key={i}
            className={`max-w-[90%] rounded-md px-3 py-2 text-xs whitespace-pre-wrap ${
              m.role === "user"
                ? "self-end bg-slate-900 text-white"
                : "self-start bg-slate-100 text-slate-800"
            }`}
          >
            {m.text}
          </div>
        ))}
        {asking && <p className="text-xs text-slate-400">Thinking…</p>}
      </div>

      {error && <p className="px-4 text-xs text-red-600">{error}</p>}

      <form onSubmit={handleAsk} className="flex gap-2 border-t border-slate-200 p-3">
        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask a security question…"
          className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-slate-500 focus:outline-none"
        />
        <button
          type="submit"
          disabled={asking}
          className="rounded-md bg-slate-900 px-3 py-2 text-xs font-medium text-white disabled:opacity-50"
        >
          Send
        </button>
      </form>
    </div>
  );
}
