"use client";

import { ChangeEvent, useRef, useState } from "react";
import {
  addStoredItem,
  formatDateLabel,
  getPdfPageCount,
  loadStoredItems,
  StoredItem,
} from "@/lib/storage";

export default function UploadPage() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [pdfTitle, setPdfTitle] = useState("");
  const [textTitle, setTextTitle] = useState("");
  const [textContent, setTextContent] = useState("");

  const [pdfItems, setPdfItems] = useState<StoredItem[]>(() =>
    loadStoredItems().filter((item) => item.type === "pdf"),
  );

  const [pdfError, setPdfError] = useState("");
  const [textError, setTextError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

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

    const pageCount = await getPdfPageCount(file);
    if (pageCount > 5) {
      setPdfError("Only PDFs up to 5 pages allowed");
      event.target.value = "";
      return;
    }

    const fallbackTitle = file.name.replace(/\.pdf$/i, "");
    const resolvedTitle = pdfTitle.trim() || fallbackTitle;

    const newItem: StoredItem = {
      id: crypto.randomUUID(),
      type: "pdf",
      title: resolvedTitle,
      content: file.name,
      fileName: file.name,
      pages: pageCount,
      createdAt: new Date().toISOString(),
    };

    const updated = addStoredItem(newItem);
    setPdfItems(updated.filter((item) => item.type === "pdf"));
    setPdfTitle("");
    setSuccessMessage("Saved successfully");
    event.target.value = "";
  };

  const handleSaveText = () => {
    clearMessages();

    if (!textTitle.trim()) {
      setTextError("Missing title");
      return;
    }

    if (!textContent.trim()) {
      setTextError("Please paste some notes");
      return;
    }

    const newItem: StoredItem = {
      id: crypto.randomUUID(),
      type: "text",
      title: textTitle.trim(),
      content: textContent.trim(),
      createdAt: new Date().toISOString(),
    };

    addStoredItem(newItem);
    setTextTitle("");
    setTextContent("");
    setSuccessMessage("Saved successfully");
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
            className="w-full border border-black bg-[#800080] px-4 py-3 text-left text-sm font-medium text-white"
          >
            Upload PDF
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
            className="w-full border border-black bg-black px-4 py-2 text-sm font-medium text-white sm:w-auto"
          >
            Save to ScholarMind
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

          {pdfItems.length === 0 ? (
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