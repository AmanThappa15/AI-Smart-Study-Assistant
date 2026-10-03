from typing import List, Optional
from pydantic import BaseModel

class UploadResponse(BaseModel):
    filename: str
    content_type: Optional[str] = None
    message: str
    text_length: int
    number_of_chunks: int
    chunks: List[str]

class AskResponse(BaseModel):
    question: str
    answer: str
    retrieved_chunks: List[str]
