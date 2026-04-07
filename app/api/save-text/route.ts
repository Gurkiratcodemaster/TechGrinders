import { NextRequest, NextResponse } from "next/server";
import { appendToKnowledge, cleanText, formatKnowledgeEntry } from "@/lib/knowledge";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const title = typeof body.title === "string" ? body.title.trim() : "";
    const content = typeof body.content === "string" ? body.content.trim() : "";

    if (!title) {
      return NextResponse.json({ error: "Missing title" }, { status: 400 });
    }

    if (!content) {
      return NextResponse.json({ error: "Missing content" }, { status: 400 });
    }

    const createdAt = new Date().toISOString();
    const cleanedContent = cleanText(content);
    const entry = formatKnowledgeEntry(title, createdAt, cleanedContent);

    await appendToKnowledge(entry);

    return NextResponse.json({
      ok: true,
      createdAt,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to save text" },
      { status: 500 },
    );
  }
}