"use client";

import { useMemo, useState } from "react";
import { formatDateLabel, loadStoredItems, StoredItemType } from "@/lib/storage";

export default function NotesPage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | StoredItemType>("all");
  const [items] = useState(() => loadStoredItems());

  const filteredItems = useMemo(() => {
    const query = search.trim().toLowerCase();

    return items.filter((item) => {
      const matchType = filter === "all" ? true : item.type === filter;
      const matchSearch =
        query.length === 0
          ? true
          : item.title.toLowerCase().includes(query) ||
            item.content.toLowerCase().includes(query);

      return matchType && matchSearch;
    });
  }, [filter, items, search]);

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
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="w-full border border-black px-3 py-2 text-sm outline-none focus:border-[#800080]"
            placeholder="Search your notes"
          />
        </div>

        <div className="mt-4 flex flex-wrap gap-2 text-xs">
          <button
            type="button"
            onClick={() => setFilter("all")}
            className={`border px-3 py-1 ${
              filter === "all"
                ? "border-[#800080] text-[#800080]"
                : "border-black"
            }`}
          >
            All
          </button>
          <button
            type="button"
            onClick={() => setFilter("pdf")}
            className={`border px-3 py-1 ${
              filter === "pdf"
                ? "border-[#800080] text-[#800080]"
                : "border-black"
            }`}
          >
            PDF
          </button>
          <button
            type="button"
            onClick={() => setFilter("text")}
            className={`border px-3 py-1 ${
              filter === "text"
                ? "border-[#800080] text-[#800080]"
                : "border-black"
            }`}
          >
            Notes
          </button>
        </div>
      </section>

      {filteredItems.length === 0 ? (
        <section className="border border-black p-5 text-sm">
          No notes uploaded yet
        </section>
      ) : null}

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredItems.map((item) => (
          <article key={item.id} className="border border-black p-4">
            <p className="title-font text-sm font-semibold">{item.title}</p>
            <p className="mt-2 text-xs uppercase">Type: {item.type}</p>
            <p className="mt-2 text-xs text-black">
              {item.type === "text"
                ? `${item.content.slice(0, 80)}${
                    item.content.length > 80 ? "..." : ""
                  }`
                : `File: ${item.fileName ?? item.content}`}
            </p>
            <p className="mt-3 border border-[#800080] px-2 py-1 text-xs text-[#800080]">
              {formatDateLabel(item.createdAt)}
            </p>
          </article>
        ))}
      </section>
    </div>
  );
}