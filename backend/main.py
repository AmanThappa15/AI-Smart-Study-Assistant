import sys
from pathlib import Path

# Ensure backend directory is in sys.path
BACKEND_DIR = Path(__file__).resolve().parent
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

import pymupdf
from fastapi import FastAPI, UploadFile, File, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware

from core.config import settings, get_gemini_client
from routers import health
from schemas.study import UploadResponse, AskResponse

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="AI Smart Study Assistant API",
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(health.router)

# Preserved Phase 1 in-memory storage (will be replaced by Vector DB in Phase 2)
document_chunks: list[str] = []

def extract_text_from_pdf(file_path: Path) -> str:
    """Extracts raw text from a PDF file using PyMuPDF."""
    document = pymupdf.open(str(file_path))
    text = ""
    for page in document:
        text += page.get_text()
    document.close()
    return text

def split_text(text: str, chunk_size: int = 1000, overlap: int = 200) -> list[str]:
    """Splits text into paragraph-aware chunks with overlap."""
    paragraphs = text.split("\n")
    chunks = []
    current_chunk = ""

    for paragraph in paragraphs:
        paragraph = paragraph.strip()
        if not paragraph:
            continue

        if len(current_chunk) + len(paragraph) + 1 <= chunk_size:
            current_chunk += paragraph + "\n"
        else:
            chunks.append(current_chunk.strip())
            overlap_text = current_chunk[-overlap:]
            current_chunk = overlap_text + "\n" + paragraph + "\n"

    if current_chunk:
        chunks.append(current_chunk.strip())

    return chunks

def retrieve_relevant_chunks(question: str, chunks: list[str], top_k: int = 3) -> list[str]:
    """Keyword-based chunk retrieval (preserved for Phase 1 compatibility)."""
    question_words = set(question.lower().split())
    scored_chunks = []

    for chunk in chunks:
        chunk_words = set(chunk.lower().split())
        score = len(question_words & chunk_words)
        scored_chunks.append((score, chunk))

    scored_chunks.sort(reverse=True, key=lambda x: x[0])
    return [chunk for score, chunk in scored_chunks[:top_k]]

@app.post("/upload", response_model=UploadResponse)
async def upload_file(file: UploadFile = File(...)):
    """Uploads and processes a PDF file."""
    global document_chunks

    if not file.filename or not file.filename.lower().endswith(".pdf"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only PDF files are supported."
        )

    # Sanitize filename
    safe_filename = Path(file.filename).name
    file_path = settings.UPLOAD_DIR / safe_filename

    contents = await file.read()
    if not contents:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded file is empty."
        )

    with open(file_path, "wb") as buffer:
        buffer.write(contents)

    extracted_text = extract_text_from_pdf(file_path)
    chunks = split_text(extracted_text)
    document_chunks = chunks

    return {
        "filename": safe_filename,
        "content_type": file.content_type,
        "message": "File uploaded and processed successfully",
        "text_length": len(extracted_text),
        "number_of_chunks": len(chunks),
        "chunks": chunks,
    }

@app.get("/ask", response_model=AskResponse)
def ask_question(question: str):
    """Answers questions based on retrieved document chunks."""
    if not document_chunks:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Please upload a PDF first."
        )

    relevant_chunks = retrieve_relevant_chunks(question, document_chunks)
    context = "\n\n".join(relevant_chunks)

    prompt = f"""You are an AI Study Assistant.

Answer the user's question using the provided document.

DOCUMENT CONTEXT:

{context}

USER QUESTION:

{question}

Instructions:
- Answer using the document context.
- Do not invent information.
- If the answer is not present in the document, say:
"I could not find this information in the uploaded document."

Give a clear and concise answer.
"""
    try:
        client = get_gemini_client()
        response = client.models.generate_content(
            model=settings.DEFAULT_GEMINI_MODEL,
            contents=prompt,
        )
        return {
            "question": question,
            "answer": response.text,
            "retrieved_chunks": relevant_chunks,
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error generating answer: {str(e)}"
        )
