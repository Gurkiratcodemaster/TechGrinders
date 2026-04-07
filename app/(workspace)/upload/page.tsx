const filePreview = [
  { name: "Linear Algebra Notes.pdf", size: "1.8 MB", pages: 5 },
  { name: "Compiler Design Cheatsheet.pdf", size: "730 KB", pages: 3 },
  { name: "Huge Archive.pdf", size: "12.1 MB", pages: 18 },
];

export default function UploadPage() {
  return (
    <div className="space-y-6">
      <header className="border border-black p-5">
        <h1 className="title-font text-2xl font-bold">Upload Section</h1>
        <p className="mt-2 text-sm">Upload PDFs or paste text to build your study memory.</p>
      </header>

      <section className="grid gap-6 xl:grid-cols-2">
        <article className="space-y-4 border border-black p-5">
          <h2 className="title-font text-lg font-semibold">Source Input</h2>
          <button className="w-full border border-black bg-[#800080] px-4 py-3 text-left text-sm font-medium text-white">
            Upload PDF
          </button>
          <p className="text-xs text-[#800080]">Limit: Max 5 pages</p>
          <label className="block text-sm font-medium" htmlFor="paste-notes">
            Paste Text
          </label>
          <textarea
            id="paste-notes"
            rows={8}
            placeholder="Paste class notes, web snippets, or revision points here"
            className="w-full resize-none border border-black p-3 text-sm outline-none focus:border-[#800080]"
          />
          <button className="border border-black bg-black px-4 py-2 text-sm font-medium text-white">
            Save to ScholarMind
          </button>
        </article>

        <article className="space-y-4 border border-black p-5">
          <h2 className="title-font text-lg font-semibold">File Preview</h2>
          <ul className="space-y-3 text-sm">
            {filePreview.map((file) => (
              <li key={file.name} className="border border-black p-3">
                <p className="font-medium">{file.name}</p>
                <p>
                  {file.size} | {file.pages} pages
                </p>
              </li>
            ))}
          </ul>

          <div className="border border-[#800080] p-3 text-sm">
            Chunking text... Indexing content...
          </div>

          <div className="border border-black bg-black p-3 text-sm text-white">
            File too large. Please upload files within 5 pages.
          </div>
        </article>
      </section>
    </div>
  );
}