from __future__ import annotations

import io
import os
import re
from typing import Any

import pdfplumber
from dotenv import load_dotenv
from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from google import genai
from pydantic import BaseModel

from storage import add_item, clean_text, read_store

load_dotenv()

FALLBACK_RESPONSE = "This information is not present in your saved notes"
MODEL_NAME = "gemini-2.5-flash"
MAX_CONTEXT_CHARS = 8000
STOPWORDS = {
    "a",
    "an",
    "and",
    "are",
    "as",
    "at",
    "be",
    "by",
    "for",
    "from",
    "how",
    "i",
    "in",
    "is",
    "it",
    "of",
    "on",
    "or",
    "that",
    "the",
    "to",
    "was",
    "what",
    "when",
    "where",
    "which",
    "who",
    "why",
    "with",
    "you",
    "your",
}

app = FastAPI(title="ScholarMind Python Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class SaveTextPayload(BaseModel):
    title: str
    content: str


class AskPayload(BaseModel):
    question: str


def load_data() -> list[dict[str, Any]]:
    store = read_store()
    items = store.get("items", [])
    if isinstance(items, list):
        return [item for item in items if isinstance(item, dict)]
    return []


def _extract_keywords(question: str) -> list[str]:
    words = re.findall(r"[a-zA-Z0-9]+", question.lower())
    return [word for word in words if len(word) > 2 and word not in STOPWORDS]


def find_relevant_chunks(question: str, items: list[dict[str, Any]]) -> list[str]:
    keywords = _extract_keywords(question)
    if not keywords:
        return []

    scored_chunks: list[tuple[int, str]] = []

    for item in items:
        title = str(item.get("title", "Untitled"))
        raw_chunks = item.get("chunks", [])
        content = str(item.get("content", "")).strip()

        candidates: list[str] = []
        if isinstance(raw_chunks, list):
            candidates = [str(chunk).strip() for chunk in raw_chunks if str(chunk).strip()]
        if not candidates and content:
            candidates = [content]

        for chunk in candidates:
            chunk_lower = chunk.lower()
            score = sum(1 for keyword in keywords if keyword in chunk_lower)
            if score > 0:
                scored_chunks.append((score, f"[{title}] {chunk}"))

    scored_chunks.sort(key=lambda item: item[0], reverse=True)

    selected: list[str] = []
    used_text: set[str] = set()
    current_length = 0

    for _, chunk in scored_chunks:
        if chunk in used_text:
            continue
        next_length = current_length + len(chunk)
        if next_length > MAX_CONTEXT_CHARS:
            break
        selected.append(chunk)
        used_text.add(chunk)
        current_length = next_length
        if len(selected) >= 10:
            break

    return selected


def ask_gemini(question: str, relevant_chunks: list[str]) -> str:
    api_key = os.getenv("GEMINI_API_KEY", "").strip()
    if not api_key:
        raise HTTPException(status_code=500, detail="Missing GEMINI_API_KEY")

    context = "\n\n".join(relevant_chunks)
    prompt = (
        "You are an AI assistant that MUST answer ONLY using the provided context.\n\n"
        "STRICT RULES:\n"
        "- Do NOT use outside knowledge\n"
        "- Do NOT guess\n"
        "- If answer is not clearly present, reply EXACTLY:\n"
        f"'{FALLBACK_RESPONSE}'\n\n"
        f"Context:\n{context}\n\n"
        f"Question:\n{question}\n\n"
        "Answer:"
    )

    client = genai.Client(api_key=api_key)
    response = client.models.generate_content(
        model=MODEL_NAME,
        contents=prompt,
        config={
            "temperature": 0.1,
            "max_output_tokens": 512,
        },
    )

    text = (response.text or "").strip() if response else ""
    if not text:
        return FALLBACK_RESPONSE

    if len(text) > 2000:
        text = text[:2000].strip()

    lowered = text.lower()
    if "not present in your saved notes" in lowered:
        return FALLBACK_RESPONSE

    return text


def extract_pdf_text(file_bytes: bytes) -> tuple[str, int]:
    # Placeholder for future OCR fallback (for scanned PDFs).
    # For now we only support digital, computer-readable PDFs.
    try:
        with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
            page_count = len(pdf.pages)
            page_texts: list[str] = []
            for page in pdf.pages:
                page_texts.append(page.extract_text() or "")

        combined = clean_text("\n".join(page_texts))
        return combined, page_count
    except Exception as exc:  # noqa: BLE001
        raise ValueError("Unable to read this PDF") from exc


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/upload-pdf")
async def upload_pdf(
    file: UploadFile = File(...),
    title: str | None = Form(default=None),
) -> dict[str, Any]:
    if file.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="Please upload a PDF file")

    file_bytes = await file.read()
    try:
        text, page_count = extract_pdf_text(file_bytes)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    if page_count > 5:
        raise HTTPException(status_code=400, detail="Only PDFs up to 5 pages allowed")

    if not text:
        raise HTTPException(status_code=400, detail="Unable to read this PDF")

    resolved_title = (title or "").strip() or (file.filename or "Untitled PDF").replace(
        ".pdf", ""
    )
    item = add_item(
        title=resolved_title,
        item_type="pdf",
        content=text,
        file_name=file.filename,
        pages=page_count,
    )
    return {"ok": True, "item": item}


@app.post("/save-text")
def save_text(payload: SaveTextPayload) -> dict[str, Any]:
    title = payload.title.strip()
    content = payload.content.strip()

    if not title:
        raise HTTPException(status_code=400, detail="Missing title")
    if not content:
        raise HTTPException(status_code=400, detail="Missing content")

    item = add_item(title=title, item_type="text", content=content)
    return {"ok": True, "item": item}


@app.get("/all-notes")
def all_notes() -> dict[str, Any]:
    return {"items": load_data()}


@app.post("/ask-ai")
def ask_ai(payload: AskPayload) -> dict[str, Any]:
    question = payload.question.strip()
    if not question:
        raise HTTPException(status_code=400, detail="Question is required")

    items = load_data()
    relevant_chunks = find_relevant_chunks(question, items)

    if not relevant_chunks:
        return {"answer": FALLBACK_RESPONSE, "usedChunks": 0}

    try:
        answer = ask_gemini(question, relevant_chunks)
    except HTTPException:
        raise
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(status_code=500, detail="Gemini request failed") from exc

    return {"answer": answer, "usedChunks": len(relevant_chunks)}
