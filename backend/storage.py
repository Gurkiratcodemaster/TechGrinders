from __future__ import annotations

import json
import re
from datetime import datetime, timezone
from pathlib import Path
from typing import Any
from uuid import uuid4

ROOT_DIR = Path(__file__).resolve().parents[1]
DATA_DIR = ROOT_DIR / "data"
STORE_PATH = DATA_DIR / "central_store.json"
SECTION_DIVIDER = "----------------------"


def _default_store() -> dict[str, Any]:
    return {"items": [], "combinedText": ""}


def ensure_store() -> None:
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    if not STORE_PATH.exists():
        STORE_PATH.write_text(json.dumps(_default_store(), indent=2), encoding="utf-8")


def read_store() -> dict[str, Any]:
    ensure_store()
    try:
        raw = STORE_PATH.read_text(encoding="utf-8")
        parsed = json.loads(raw)
        if not isinstance(parsed, dict):
            return _default_store()

        items = parsed.get("items", [])
        combined_text = parsed.get("combinedText", "")
        if not isinstance(items, list):
            items = []
        if not isinstance(combined_text, str):
            combined_text = ""

        return {"items": items, "combinedText": combined_text}
    except (json.JSONDecodeError, OSError):
        return _default_store()


def write_store(store: dict[str, Any]) -> None:
    ensure_store()
    STORE_PATH.write_text(json.dumps(store, indent=2), encoding="utf-8")


def clean_text(text: str) -> str:
    compact = re.sub(r"\s+", " ", text)
    return compact.strip()


def chunk_text(text: str, chunk_size: int = 400) -> list[str]:
    words = text.split()
    if not words:
        return []

    chunks: list[str] = []
    for i in range(0, len(words), chunk_size):
        chunk = " ".join(words[i : i + chunk_size]).strip()
        if chunk:
            chunks.append(chunk)
    return chunks


def format_combined_section(title: str, created_at: str, content: str, item_type: str) -> str:
    return (
        f"TITLE: {title}\n"
        f"DATE: {created_at}\n"
        f"TYPE: {item_type}\n"
        f"CONTENT: {content}\n"
        f"{SECTION_DIVIDER}\n"
    )


def add_item(title: str, item_type: str, content: str, file_name: str | None = None, pages: int | None = None) -> dict[str, Any]:
    cleaned_content = clean_text(content)
    created_at = datetime.now(timezone.utc).isoformat()

    item: dict[str, Any] = {
        "id": str(uuid4()),
        "title": title,
        "type": item_type,
        "content": cleaned_content,
        "chunks": chunk_text(cleaned_content),
        "createdAt": created_at,
    }

    if file_name:
        item["fileName"] = file_name
    if pages is not None:
        item["pages"] = pages

    store = read_store()
    store["items"] = [item, *store["items"]]
    store["combinedText"] = store["combinedText"] + format_combined_section(
        title=title,
        created_at=created_at,
        content=cleaned_content,
        item_type=item_type,
    )
    write_store(store)

    return item


def get_all_items() -> list[dict[str, Any]]:
    store = read_store()
    items = store.get("items", [])
    if isinstance(items, list):
        return items
    return []
