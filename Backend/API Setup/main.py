import os
from pydantic import BaseModel
from fastapi import FastAPI, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from query_answering import get_answer, process_files

app = FastAPI(debug=True)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class QueryInput(BaseModel):
    query: str

@app.get("/")
def read_root():
    return {"message": "Welcome to the FastAPI To-Do App!"}

@app.post("/query")
def get_input(input_data: QueryInput):
    response = get_answer(input_data.query)
    return response

@app.post("/process_files")
async def process_uploaded_file(
    file: UploadFile = File(...), 
    uploadType: str = Form(...)
):
    file_path = f"uploaded_documents/{file.filename}"
    with open(file_path, "wb") as f:
        content = await file.read()  # Read the file content
        f.write(content)
    process_files(uploadType)
    os.remove(file_path)
    return {"status" : "Success"}