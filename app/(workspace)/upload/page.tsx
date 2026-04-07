"use client";

import { ChangeEvent, useCallback, useEffect, useRef, useState } from "react";

type BackendItem = {
  id: string;
  type: "pdf" | "text";
  title: string;
  content: string;
  createdAt: string;
  fileName?: string;
  pages?: number;
};

const PYTHON_API_BASE_URL =
  process.env.NEXT_PUBLIC_PYTHON_API_URL ?? "http://127.0.0.1:8000";

function formatDateLabel(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function UploadPage() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [pdfTitle, setPdfTitle] = useState("");
  const [textTitle, setTextTitle] = useState("");
  const [textContent, setTextContent] = useState("");

  const [pdfItems, setPdfItems] = useState<BackendItem[]>([]);
  const [loadingPdfList, setLoadingPdfList] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [pdfError, setPdfError] = useState("");
  const [textError, setTextError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const refreshPdfItems = useCallback(async () => {
    setLoadingPdfList(true);
    try {
      const response = await fetch(`${PYTHON_API_BASE_URL}/all-notes`);
      const data = (await response.json()) as { items?: BackendItem[] };
      const items = Array.isArray(data.items) ? data.items : [];
      setPdfItems(items.filter((item) => item.type === "pdf"));
    } catch {
      setPdfError("Could not load notes from backend");
    } finally {
      setLoadingPdfList(false);
    }
  }, []);

  useEffect(() => {
    void refreshPdfItems();
  }, [refreshPdfItems]);

  const clearMessages = () => {
    setPdfError("");
    setTextError("");
    setSuccessMessage("");
  };

  const handlePdfUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    clearMessages();

    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    if (file.type !== "application/pdf") {
      setPdfError("Please upload a PDF file");
      event.target.value = "";
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    if (pdfTitle.trim()) {
      formData.append("title", pdfTitle.trim());
    }

    setSubmitting(true);
    try {
      const response = await fetch(`${PYTHON_API_BASE_URL}/upload-pdf`, {
        method: "POST",
        body: formData,
      });

      const data = (await response.json()) as { detail?: string };
      if (!response.ok) {
        setPdfError(data.detail ?? "Unable to read this PDF");
        event.target.value = "";
        return;
      }

      await refreshPdfItems();
      setPdfTitle("");
      setSuccessMessage("Saved successfully");
      event.target.value = "";
    } catch {
      setPdfError("Could not connect to Python backend");
      event.target.value = "";
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveText = async () => {
    clearMessages();

    if (!textTitle.trim()) {
      setTextError("Missing title");
      return;
    }

    if (!textContent.trim()) {
      setTextError("Please paste some notes");
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(`${PYTHON_API_BASE_URL}/save-text`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: textTitle.trim(),
          content: textContent.trim(),
        }),
      });

      const data = (await response.json()) as { detail?: string };
      if (!response.ok) {
        setTextError(data.detail ?? "Failed to save text");
        return;
      }

      setTextTitle("");
      setTextContent("");
      setSuccessMessage("Saved successfully");
    } catch {
      setTextError("Could not connect to Python backend");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <header className="border border-black p-5">
        <h1 className="title-font text-2xl font-bold">Upload Section</h1>
        <p className="mt-2 text-sm">
          Upload PDFs or paste text to build your study memory.
        </p>
      </header>

      <section className="grid gap-6 lg:grid-cols-2">
        <article className="space-y-4 border border-black p-5">
          <h2 className="title-font text-lg font-semibold">Source Input</h2>

          <label className="block text-sm font-medium" htmlFor="pdf-title">
            PDF Title (optional)
          </label>
          <input
            id="pdf-title"
            value={pdfTitle}
            onChange={(event) => setPdfTitle(event.target.value)}
            className="w-full border border-black px-3 py-2 text-sm outline-none focus:border-[#800080]"
            placeholder="Auto-uses filename if left blank"
          />

          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf"
            onChange={handlePdfUpload}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={submitting}
            className="w-full border border-black bg-[#800080] px-4 py-3 text-left text-sm font-medium text-white"
          >
            {submitting ? "Saving..." : "Upload PDF"}
          </button>
          <p className="text-xs text-[#800080]">Limit: Max 5 pages</p>

          <label className="block text-sm font-medium" htmlFor="text-title">
            Title
          </label>
          <input
            id="text-title"
            value={textTitle}
            onChange={(event) => setTextTitle(event.target.value)}
            className="w-full border border-black px-3 py-2 text-sm outline-none focus:border-[#800080]"
            placeholder="e.g. Recursion revision"
          />

          <label className="block text-sm font-medium" htmlFor="text-content">
            Paste Text
          </label>
          <textarea
            id="text-content"
            rows={8}
            value={textContent}
            onChange={(event) => setTextContent(event.target.value)}
            placeholder="Paste class notes, web snippets, or revision points here"
            className="w-full resize-none border border-black p-3 text-sm outline-none focus:border-[#800080]"
          />
          <button
            type="button"
            onClick={handleSaveText}
            disabled={submitting}
            className="w-full border border-black bg-black px-4 py-2 text-sm font-medium text-white sm:w-auto"
          >
            {submitting ? "Saving..." : "Save to ScholarMind"}
          </button>

          {pdfError ? (
            <p className="border border-black bg-black p-3 text-sm text-white">
              {pdfError}
            </p>
          ) : null}

          {textError ? (
            <p className="border border-black bg-black p-3 text-sm text-white">
              {textError}
            </p>
          ) : null}

          {successMessage ? (
            <p className="border border-[#800080] p-3 text-sm text-[#800080]">
              {successMessage}
            </p>
          ) : null}
        </article>

        <article className="space-y-4 border border-black p-5">
          <h2 className="title-font text-lg font-semibold">Uploaded PDFs</h2>
          <div className="border border-[#800080] p-3 text-sm">
            Chunking text... Indexing content... Retrieving relevant data...
          </div>

          {loadingPdfList ? (
            <p className="border border-black p-3 text-sm">Loading...</p>
          ) : null}

          {!loadingPdfList && pdfItems.length === 0 ? (
            <p className="border border-black p-3 text-sm">No notes uploaded yet</p>
          ) : null}

          <ul className="grid gap-3 text-sm sm:grid-cols-2 xl:grid-cols-1">
            {pdfItems.map((file) => (
              <li key={file.id} className="border border-black p-3">
                <p className="font-medium">{file.title}</p>
                <p className="mt-1 text-xs">Date: {formatDateLabel(file.createdAt)}</p>
                <p>
                  {(file.pages ?? 0) > 0 ? `${file.pages} pages` : "Page count unavailable"}
                </p>
              </li>
            ))}
          </ul>
        </article>
      </section>
    </div>
  );
}