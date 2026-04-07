# ScholarMind

ScholarMind is a simple Next.js + Python project where students can:

1. Upload digital PDFs (up to 5 pages)
2. Paste notes as plain text
3. Store everything in one central file for future Ask-AI usage

## Stack

1. Frontend: Next.js + Tailwind CSS
2. Backend: FastAPI + pdfplumber
3. Storage: JSON file at `data/central_store.json`

## Central Storage Format

The Python backend stores every entry in one file:

```json
{
	"items": [
		{
			"id": "...",
			"title": "Recursion Notes",
			"type": "text",
			"content": "...",
			"chunks": ["...", "..."],
			"createdAt": "2026-04-07T..."
		}
	],
	"combinedText": "TITLE: ...\nDATE: ...\nCONTENT: ...\n----------------------\n"
}
```

`combinedText` is ready for future Ask-AI prompts without re-reading PDFs.

## Run Locally

1. Install Node dependencies:

```bash
npm install
```

2. Install Python dependencies:

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cd ..
```

3. Create environment file:

```bash
cp .env.example .env.local
```

4. Run Python backend (port 8000):

```bash
npm run dev:py
```

5. Run Next.js frontend (port 3000):

```bash
npm run dev
```

## API Endpoints

### `POST /upload-pdf`

Accepts multipart form data:

1. `file` (PDF)
2. `title` (optional)

Rules:

1. Must be a PDF
2. Must be 5 pages or less
3. If parsing fails: `Unable to read this PDF`

### `POST /save-text`

JSON body:

```json
{
	"title": "My Notes",
	"content": "Paste your text here"
}
```

### `GET /all-notes`

Returns all stored items from `data/central_store.json`.

## Example API Usage

### Save text

```bash
curl -X POST http://127.0.0.1:8000/save-text \
	-H "Content-Type: application/json" \
	-d '{"title":"OS Notes","content":"Process scheduling notes..."}'
```

### Upload PDF

```bash
curl -X POST http://127.0.0.1:8000/upload-pdf \
	-F "title=Networks Unit 1" \
	-F "file=@/absolute/path/to/file.pdf"
```

### Fetch all notes

```bash
curl http://127.0.0.1:8000/all-notes
```

## Future-Ready Notes

Current pipeline is intentionally simple for hackathons.
Later, you can add:

1. Embeddings for semantic search
2. RAG with LangChain
3. Claude/Gemini/OpenAI answer generation from `combinedText` or `chunks`
