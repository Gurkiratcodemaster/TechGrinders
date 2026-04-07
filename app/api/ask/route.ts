import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { getRelevantNotes, readKnowledge } from "@/lib/knowledge";

const MODEL_NAME = "gemini-1.5-flash";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const question = typeof body.question === "string" ? body.question.trim() : "";

    if (!question) {
      return NextResponse.json({ error: "Question is required" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Missing GEMINI_API_KEY" },
        { status: 500 },
      );
    }

    const knowledgeText = await readKnowledge();
    if (!knowledgeText.trim()) {
      return NextResponse.json({ answer: "Not found in your notes" });
    }

    const notesForPrompt = getRelevantNotes(knowledgeText, question);

    const prompt = [
      "You are an AI assistant. Answer ONLY using the provided user notes below.",
      "If answer is not found, say 'Not found in your notes'.",
      "",
      `USER NOTES: ${notesForPrompt}`,
      "",
      `QUESTION: ${question}`,
    ].join("\n");

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });
    const result = await model.generateContent(prompt);
    const answer = result.response.text().trim() || "Not found in your notes";

    return NextResponse.json({ answer });
  } catch {
    return NextResponse.json({ error: "Failed to get AI answer" }, { status: 500 });
  }
}