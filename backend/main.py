from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import os
import pymupdf
from dotenv import load_dotenv
from google import genai
from pathlib import Path
BASE_DIR = Path(__file__).resolve().parent.parent
ENV_FILE = BASE_DIR / ".env"

load_dotenv(ENV_FILE)

api_key = os.getenv("GEMINI_API_KEY")

print("API KEY FOUND:", api_key is not None)

client = genai.Client(api_key=api_key)
app = FastAPI()
document_chunks = []
UPLOAD_DIR = "uploads"

os.makedirs(UPLOAD_DIR, exist_ok=True)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
@app.get("/")
def home():
    return {
        "message": "AI Study Assistant Backend is Working!"
    }
@app.get("/health")
def health_check():
    return {
        "status": "Backend is healthy"
    }
@app.get("/test-gemini")
def test_gemini():

    response = client.models.generate_content(
        model="gemini-3.6-flash",
        contents="Explain what a database in one sentence"
    )

    return {
        "response": response.text
    }
def retrieve_relevant_chunks(question, chunks, top_k=3):

    question_words = set(question.lower().split())

    scored_chunks = []

    for chunk in chunks:

        chunk_words = set(chunk.lower().split())

        score = len(question_words & chunk_words)

        scored_chunks.append((score, chunk))
    scored_chunks.sort(
        reverse=True,
        key=lambda x: x[0]
    )
    return [
        chunk
        for score, chunk in scored_chunks[:top_k]
    ]
@app.get("/ask")
def ask_question(question: str):
    if not document_chunks:
        return {
            "error": "Please upload a PDF first."
        }
    relevant_chunks = retrieve_relevant_chunks(
        question,
        document_chunks
    )
    context = "\n\n".join(relevant_chunks)
    prompt = f"""
You are an AI Study Assistant.

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
    response = client.models.generate_content(
        model="gemini-3.6-flash",
        contents=prompt
    )

    return {
        "question": question,
        "answer": response.text,
        "retrieved_chunks": relevant_chunks
    }
def extract_text_from_pdf(file_path):

    document = pymupdf.open(file_path)

    text = ""

    for page in document:
        text += page.get_text()

    document.close()

    return text
def split_text(text, chunk_size=1000, overlap=200):

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

            chunks.append(
                current_chunk.strip()
            )

            overlap_text = current_chunk[-overlap:]

            current_chunk = (
                overlap_text
                + "\n"
                + paragraph
                + "\n"
            )
    if current_chunk:

        chunks.append(
            current_chunk.strip()
        )

    return chunks
@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):

    global document_chunks
    file_path = os.path.join(
        UPLOAD_DIR,
        file.filename
    )
    contents = await file.read()
    if not contents:

        return {
            "error": "Uploaded file is empty"
        }
    with open(file_path, "wb") as buffer:

        buffer.write(contents)
    extracted_text = extract_text_from_pdf(
        file_path
    )
    chunks = split_text(
        extracted_text
    )
    document_chunks = chunks


    print("===== UPLOAD DEBUG =====")

    print(
        "Text Length:",
        len(extracted_text)
    )

    print(
        "Number of chunks:",
        len(document_chunks)
    )

    print(
        "First chunk:",
        document_chunks[0][:200]
        if document_chunks
        else "NO CHUNKS"
    )

    print("=======================")
    return {

        "filename": file.filename,

        "content_type": file.content_type,

        "message": "File uploaded and processed successfully",

        "text_length": len(extracted_text),

        "number_of_chunks": len(chunks),

        "chunks": chunks
    }