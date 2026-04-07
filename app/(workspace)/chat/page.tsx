"use client";

import { FormEvent, useState } from "react";

type ChatMessage = {
  role: "user" | "ai";
  text: string;
};

type AskResponse = {
  answer?: string;
  detail?: string;
};

const PYTHON_API_BASE_URL =
  process.env.NEXT_PUBLIC_PYTHON_API_URL ?? "http://127.0.0.1:8000";

export default function ChatPage() {
  const [question, setQuestion] = useState("");
  const [chatItems, setChatItems] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleAsk = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = question.trim();

    if (!trimmed) {
      setErrorMessage("Please enter a question");
      return;
    }

    setErrorMessage("");
    setIsLoading(true);
    setChatItems((prev) => [...prev, { role: "user", text: trimmed }]);
    setQuestion("");

    try {
      const response = await fetch(`${PYTHON_API_BASE_URL}/ask-ai`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: trimmed }),
      });

      const data = (await response.json()) as AskResponse;
      if (!response.ok) {
        setErrorMessage(data.detail ?? "Failed to get answer");
        return;
      }

      setChatItems((prev) => [
        ...prev,
        {
          role: "ai",
          text:
            data.answer ??
            "This information is not present in your saved notes",
        },
      ]);
    } catch {
      setErrorMessage("Could not connect to Python backend");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <header className="border border-black p-5">
        <h1 className="title-font text-2xl font-bold">AI Chat Interface</h1>
        <p className="mt-2 text-sm text-[#800080]">
          Answers based only on your saved notes
        </p>
      </header>

      <section className="border border-black p-5">
        <div className="space-y-3">
          {chatItems.length === 0 ? (
            <div className="border border-black p-3 text-sm">
              Ask a question about your uploaded notes to get started.
            </div>
          ) : null}

          {chatItems.map((item, index) => (
            <div
              key={`${item.role}-${index}`}
              className={`max-w-3xl border p-3 text-sm ${
                item.role === "user"
                  ? "ml-auto border-black bg-black text-white"
                  : "border-[#800080]"
              }`}
            >
              <p className="mb-1 title-font text-xs uppercase tracking-[0.08em]">
                {item.role === "user" ? "You" : "ScholarMind AI"}
              </p>
              <p>{item.text}</p>
            </div>
          ))}

          {isLoading ? (
            <div className="max-w-3xl border border-[#800080] p-3 text-sm">
              <p className="mb-1 title-font text-xs uppercase tracking-[0.08em]">
                ScholarMind AI
              </p>
              <p>Thinking...</p>
            </div>
          ) : null}
        </div>

        <div className="mt-6 space-y-3">
          <div className="border border-[#800080] p-3 text-sm">
            Retrieving relevant data...
          </div>
          <form onSubmit={handleAsk} className="border border-black p-3 text-sm">
            <label htmlFor="ai-ask" className="mb-2 block font-medium">
              Ask something like: What did I save about recursion?
            </label>
            <div className="flex flex-col gap-3 md:flex-row">
              <input
                id="ai-ask"
                value={question}
                onChange={(event) => setQuestion(event.target.value)}
                className="w-full border border-black px-3 py-2 outline-none focus:border-[#800080]"
                placeholder="Type your question"
              />
              <button
                type="submit"
                disabled={isLoading}
                className="border border-black bg-[#800080] px-5 py-2 text-white"
              >
                Ask AI
              </button>
            </div>
          </form>
          {errorMessage ? (
            <p className="border border-black bg-black p-2 text-xs text-white">
              {errorMessage}
            </p>
          ) : null}
          <p className="border border-black bg-black p-2 text-xs text-white">
            Token limit warning: Your context is near limit. Remove older notes
            to keep responses precise.
          </p>
        </div>
      </section>
    </div>
  );
}