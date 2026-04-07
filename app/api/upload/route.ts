import { NextRequest, NextResponse } from "next/server";
import pdf from "pdf-parse/lib/pdf-parse.js";
import { appendToKnowledge, cleanText, formatKnowledgeEntry } from "@/lib/knowledge";

export const runtime = "nodejs";

type PdfParseResult = {
  text: string;
  numpages: number;
};

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const titleField = formData.get("title");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (file.type !== "application/pdf") {
      return NextResponse.json({ error: "Please upload a PDF file" }, { status: 400 });
    }

    const rawTitle = typeof titleField === "string" ? titleField.trim() : "";
    const fallbackTitle = file.name.replace(/\.pdf$/i, "");
    const title = rawTitle || fallbackTitle;

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    let result: PdfParseResult;
    try {
      result = (await pdf(buffer)) as PdfParseResult;
    } catch {
      return NextResponse.json({ error: "Unable to read this PDF" }, { status: 400 });
    }

    if (result.numpages > 5) {
      return NextResponse.json(
        { error: "Only PDFs up to 5 pages allowed" },
        { status: 400 },
      );
    }

    const extractedText = cleanText(result.text || "");
    if (!extractedText) {
      return NextResponse.json({ error: "Unable to read this PDF" }, { status: 400 });
    }

    const createdAt = new Date().toISOString();
    const entry = formatKnowledgeEntry(title, createdAt, extractedText);
    await appendToKnowledge(entry);

    return NextResponse.json({
      ok: true,
      createdAt,
      title,
      pages: result.numpages,
      fileName: file.name,
    });
  } catch {
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}