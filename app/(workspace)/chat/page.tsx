const chatItems = [
  {
    role: "user",
    text: "What did I save about recursion?",
  },
  {
    role: "ai",
    text: "From your note on recursion: always define the base case first, then reduce input size in each call.",
  },
  {
    role: "user",
    text: "Give me a quick revision checklist for recursion problems.",
  },
  {
    role: "ai",
    text: "Checklist: base case, recursive step, state transition, dry run with small input, and stack depth check.",
  },
];

export default function ChatPage() {
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
        </div>

        <div className="mt-6 space-y-3">
          <div className="border border-[#800080] p-3 text-sm">
            Retrieving relevant data...
          </div>
          <div className="border border-black p-3 text-sm">
            <label htmlFor="ai-ask" className="mb-2 block font-medium">
              Ask something like: What did I save about recursion?
            </label>
            <div className="flex flex-col gap-3 md:flex-row">
              <input
                id="ai-ask"
                className="w-full border border-black px-3 py-2 outline-none focus:border-[#800080]"
                placeholder="Type your question"
              />
              <button className="border border-black bg-[#800080] px-5 py-2 text-white">
                Ask AI
              </button>
            </div>
          </div>
          <p className="border border-black bg-black p-2 text-xs text-white">
            Token limit warning: Your context is near limit. Remove older notes
            to keep responses precise.
          </p>
        </div>
      </section>
    </div>
  );
}