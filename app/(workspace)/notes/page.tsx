const notes = [
  {
    title: "Recursion Basics",
    type: "Note",
    tag: "dsa",
    updated: "Updated today",
  },
  {
    title: "Computer Networks Unit 3.pdf",
    type: "PDF",
    tag: "semester-4",
    updated: "Updated yesterday",
  },
  {
    title: "https://example.com/dp-cheatsheet",
    type: "Link",
    tag: "dynamic-programming",
    updated: "Updated 3 days ago",
  },
  {
    title: "Database Indexing Short Notes",
    type: "Note",
    tag: "dbms",
    updated: "Updated 1 week ago",
  },
];

export default function NotesPage() {
  return (
    <div className="space-y-6">
      <header className="border border-black p-5">
        <h1 className="title-font text-2xl font-bold">Notes and Storage</h1>
        <p className="mt-2 text-sm">
          Browse saved notes, PDFs, and links with search and filters.
        </p>
      </header>

      <section className="border border-black p-5">
        <div className="flex flex-col gap-3 md:flex-row">
          <input
            className="w-full border border-black px-3 py-2 text-sm outline-none focus:border-[#800080]"
            placeholder="Search your notes"
          />
          <button className="border border-black bg-black px-4 py-2 text-sm text-white">
            Search
          </button>
        </div>

        <div className="mt-4 flex flex-wrap gap-2 text-xs">
          <button className="border border-[#800080] px-3 py-1 text-[#800080]">
            All
          </button>
          <button className="border border-black px-3 py-1">PDF</button>
          <button className="border border-black px-3 py-1">Notes</button>
          <button className="border border-black px-3 py-1">Links</button>
          <button className="border border-black px-3 py-1">Tag: dsa</button>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {notes.map((item) => (
          <article key={item.title} className="border border-black p-4">
            <p className="title-font text-sm font-semibold">{item.title}</p>
            <p className="mt-2 text-xs">Type: {item.type}</p>
            <p className="mt-1 text-xs">Tag: {item.tag}</p>
            <p className="mt-3 border border-[#800080] px-2 py-1 text-xs text-[#800080]">
              {item.updated}
            </p>
          </article>
        ))}
      </section>
    </div>
  );
}