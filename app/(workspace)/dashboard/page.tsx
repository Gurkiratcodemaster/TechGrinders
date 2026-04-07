const recentUploads = [
  { name: "Operating Systems - Unit 2.pdf", pages: "5 pages", status: "Indexed" },
  { name: "DSA Quick Revision.pdf", pages: "4 pages", status: "Chunking" },
  { name: "Lecture Notes: Graph Theory", pages: "3 pages", status: "Ready" },
];

const activity = [
  "Added PDF: Operating Systems - Unit 2.pdf",
  "Saved note: Recursion base cases",
  "Asked AI: Compare DFS and BFS",
  "Tagged note: dynamic-programming",
];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <header className="border border-black p-5">
        <h1 className="title-font text-2xl font-bold">Dashboard</h1>
        <p className="mt-2 text-sm">Overview of your recent uploads and study activity.</p>
      </header>

      <section className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <article className="border border-black p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="title-font text-lg font-semibold">Recent Uploads</h2>
            <span className="border border-[#800080] px-2 py-1 text-xs text-[#800080]">
              Max 5 pages per upload
            </span>
          </div>
          <ul className="space-y-3">
            {recentUploads.map((file) => (
              <li key={file.name} className="border border-black p-3">
                <p className="font-medium">{file.name}</p>
                <div className="mt-1 flex items-center justify-between text-sm">
                  <span>{file.pages}</span>
                  <span className="border border-[#800080] px-2 py-0.5 text-[#800080]">
                    {file.status}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </article>

        <article className="border border-black p-5">
          <h2 className="title-font text-lg font-semibold">Activity Feed</h2>
          <ul className="mt-4 space-y-3 text-sm">
            {activity.map((entry) => (
              <li key={entry} className="border border-black p-3">
                {entry}
              </li>
            ))}
          </ul>
        </article>
      </section>

      <section className="border border-[#800080] p-5">
        <h3 className="title-font text-base font-semibold">Empty State Preview</h3>
        <p className="mt-2 text-sm">No notes uploaded yet</p>
      </section>
    </div>
  );
}