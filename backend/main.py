from __future__ import annotations

import io
from typing import Any

import pdfplumber
from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from storage import add_item, clean_text, get_all_items

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
    return {"items": get_all_items()}
