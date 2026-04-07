import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-white text-black">
      <section className="mx-auto flex max-w-6xl flex-col gap-10 px-6 py-16 lg:px-12">
        <header className="flex flex-wrap items-center justify-between gap-4 border border-black p-4">
          <div>
            <p className="title-font text-xl font-bold uppercase tracking-[0.14em]">
              ScholarMind
            </p>
            <p className="text-sm">Your AI Second Brain for Students</p>
          </div>
          <Link
            href="/dashboard"
            className="title-font border border-black bg-[#800080] px-5 py-2 text-sm font-semibold uppercase tracking-[0.08em] text-white"
          >
            Start Saving Notes
          </Link>
        </header>

        <section className="grid gap-8 border border-black p-8 lg:grid-cols-[1.3fr_1fr]">
          <div className="space-y-6">
            <p className="title-font text-xs font-semibold uppercase tracking-[0.14em] text-[#800080]">
              What if your notes could talk back to you?
            </p>
            <h1 className="title-font max-w-xl text-4xl font-bold leading-tight md:text-5xl">
              Find answers from your own study material in seconds.
            </h1>
            <p className="max-w-xl text-base leading-7">
              Upload PDFs, save links, store notes, and ask questions in one
              clean workspace.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/dashboard"
                className="border border-black bg-black px-5 py-3 text-sm font-medium text-white"
              >
                Open Dashboard
              </Link>
              <Link
                href="/chat"
                className="border border-[#800080] px-5 py-3 text-sm font-medium text-[#800080]"
              >
                Preview AI Chat
              </Link>
            </div>
        </div>
          <div className="space-y-3 border border-[#800080] p-5">
            <p className="title-font text-sm font-semibold uppercase tracking-[0.1em]">
              Processing Flow
            </p>
            <div className="border border-black p-3 text-sm">Chunking text...</div>
            <div className="border border-black p-3 text-sm">Indexing content...</div>
            <div className="border border-black p-3 text-sm">
              Retrieving relevant data...
            </div>
          </div>
        </section>
      </section>
    </main>
  );
}
