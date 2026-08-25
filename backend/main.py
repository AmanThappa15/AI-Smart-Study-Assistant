from fastapi import FastAPI,UploadFile,File
from fastapi.middleware.cors import CORSMiddleware
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def home():
    return {"message": "AI Study Assistant Backend is Working!"}
@app.get("/health")
def health_check():
    return{"status": "Backend is healthy"}
@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    return{
        "filename":file.filename,
        "content_type" :file.content_type
    }