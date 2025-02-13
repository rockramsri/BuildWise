from pytesseract import image_to_string  # For OCR
from PIL import Image
import fitz  # For PDF processing
import pandas as pd
import os
import glob
from Pineconedb import PineconeVectorDB
from langchain.prompts import PromptTemplate
from BuildWise.BuildWise.Backend.llm_setup import LLM
import shutil
import pickle
from uuid import uuid4

# Initialize OpenAI LLM
openLlmObj = LLM()

# Define the prompt template for text analysis
prompt_template = PromptTemplate(
    input_variables=["text"],
    template="""
You are an advanced text analysis system. Analyze the following OCR-extracted text, correct minor errors, and preserve exact numerical data. Then produce exactly two paragraphs of output:

1) The first paragraph is a thorough summary of the main themes, critical information, and key findings.
2) The second paragraph contains a concise numerical analysis (values, measurements, dates, codes, identifiers).
3) The third paragraph includes information about the expiration date: provide an approximate or exact date if available; otherwise, explicitly state that the expiration is unknown.

*** IMPORTANT RULES ***
- Do not include headings, such as "Paragraph 1" or "Paragraph 2."
- Do not include any extra text, notes, disclaimers, or formatting like "Aligned and Cleaned Text:".
- Provide exactly two paragraphs in total. Nothing more.
- The first paragraph: thorough summary. The second paragraph: numerical analysis.
- Do not restate these instructions in your output.

TEXT TO ANALYZE:
{text}

FINAL OUTPUT (TWO PARAGRAPHS, NO HEADINGS, NO EXTRA TEXT):
"""
)

def delete_folder_contents(folder_path):
    if os.path.exists(folder_path):
        shutil.rmtree(folder_path)
        print(f"DEBUG: All files within '{folder_path}' deleted.")
    else:
        print(f"DEBUG: Error - Folder '{folder_path}' does not exist.")

def process_pdf(pdf_path):
    """
    Process a PDF by converting pages to images, analyzing them with a vision model,
    and cleaning up the images after extraction.

    Args:
        pdf_path (str): Path to the PDF file.

    Returns:
        str: Combined extracted and analyzed text from the PDF.
    """
    print(f"DEBUG: Starting PDF processing for '{pdf_path}'")

    # Extract text using Tesseract OCR for text-based content in the PDF
    text = extract_text_with_tesseract(pdf_path)
    print(f"DEBUG: Text extracted from PDF (Tesseract OCR): {len(text)} characters.")

    # Convert all pages of the PDF to images
    extract_images_from_pdf(pdf_path, "extracted_images")
    images = glob.glob(os.path.join("extracted_images", "*"))
    # Process each extracted image with the vision model
    img_text = ''
    for image_path in images:
        try:
            print(f"DEBUG: Analyzing image: {image_path}")
            p=openLlmObj.analyse_img(image_path)
            print("Analysed Data:  ",p)
            img_text += p  # Vision model processing
        except Exception as e:
            print(f"ERROR: Failed to analyze image {image_path}. Exception: {e}")

    # Delete extracted images after processing
    # delete_folder_contents("extracted_images")
    print("OCR TEXT: --->",text)
    print("image Analyis: ---->"+img_text)
    # Combine text extracted via OCR and vision model analysis
    return img_text

def extract_text_with_tesseract(pdf_path):
    print(f"DEBUG: Extracting text from PDF using Tesseract OCR: {pdf_path}")
    doc = fitz.open(pdf_path)
    extracted_text = ""
    for page_num in range(len(doc)):
        page = doc[page_num]
        pix = page.get_pixmap()
        img = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)
        ocr_text = image_to_string(img)
        print(f"DEBUG: OCR text extracted from page {page_num + 1}: {len(ocr_text)} characters.")
        extracted_text += f"Page {page_num + 1}:\n{ocr_text}\n"
    return extracted_text

def extract_images_from_pdf(pdf_path, output_image_dir="extracted_images"):

    print(f"DEBUG: Extracting images/graphs from PDF: {pdf_path}")
    doc = fitz.open(pdf_path)
    os.makedirs(output_image_dir, exist_ok=True)

    for page_num in range(len(doc)):
        page = doc[page_num]
        image_list = page.get_images(full=True)
        print(f"DEBUG: Page {page_num + 1} contains {len(image_list)} images.")

        for img_index, img in enumerate(image_list):
            xref = img[0]
            base_image = doc.extract_image(xref)
            image_bytes = base_image["image"]
            image_ext = base_image["ext"]
            image_filename = os.path.join(output_image_dir, f"page_{page_num + 1}_img_{img_index + 1}.{image_ext}")

            with open(image_filename, "wb") as img_file:
                img_file.write(image_bytes)
            print(f"DEBUG: Saved image: {image_filename}")

def convert_pages_to_images(pdf_path, output_image_dir="extracted_images"):
    print(f"DEBUG: Converting PDF pages to images: {pdf_path}")
    try:
        doc = fitz.open(pdf_path)
        os.makedirs(output_image_dir, exist_ok=True)
        image_paths = []

        for page_num in range(len(doc)):
            page = doc[page_num]
            pix = page.get_pixmap()
            image_filename = os.path.join(output_image_dir, f"page_{page_num + 1}.png")
            pix.save(image_filename)
            image_paths.append(image_filename)
            print(f"DEBUG: Saved page {page_num + 1} as image: {image_filename}")

        return image_paths
    except Exception as e:
        print(f"ERROR: Failed to convert pages to images. Exception: {e}")
        return []

def process_image(image_path):
    print(f"DEBUG: Processing image file: {image_path}")
    return image_to_string(Image.open(image_path))

def process_text_file(file_path):
    print(f"DEBUG: Reading text file: {file_path}")
    with open(file_path, 'r') as f:
        return f.read()

def process_csv(file_path):
    print(f"DEBUG: Reading CSV file: {file_path}")
    df = pd.read_csv(file_path)
    return df.to_string()

def process_excel(file_path):
    print(f"DEBUG: Reading Excel file: {file_path}")
    df = pd.read_excel(file_path)
    return df.to_string()

def analyze_text(text):
    print(f"DEBUG: Analyzing text using LLM. Input text length: {len(text)} characters.")
    prompt = prompt_template.format(text=text)
    return openLlmObj.answer(prompt, 0.2)

# Initialize Pinecone VectorDB
pinecone_db = PineconeVectorDB()

def process_data(uploadType):
    input_directory = "uploaded_documents"
    with open('Data/download_info.pkl', 'rb') as f:
        download_info = pickle.load(f)
    inverse_download_info = {v: k for k, v in download_info.items()}
    i = 0
    answers = []
    for file_path in glob.glob(os.path.join(input_directory, "*")):
        print('inside')
        if i==100:
            break
        print("-----------------------------------------------------------------------------------------------")
        print(f"DEBUG: Processing file {i}: {file_path}")
        try:
            if file_path.endswith(".pdf") or file_path.endswith(".PDF"):
                extracted_data = process_pdf(file_path)
            elif file_path.endswith((".jpg", ".png", ".jpeg")):
                extracted_data = process_image(file_path)
            elif file_path.endswith(".txt"):
                extracted_data = process_text_file(file_path)
            elif file_path.endswith(".csv"):
                extracted_data = process_csv(file_path)
            elif file_path.endswith((".xls", ".xlsx")):
                extracted_data = process_excel(file_path)
            else:
                print(f"DEBUG: Unsupported file type: {file_path}")
                continue
            print(f"DEBUG: Extracted data length: {len(extracted_data)} characters.")
            analyzed_data = analyze_text(extracted_data)
            print("Analysed Data: -------------------------->",analyzed_data)
            data = {
                "id": str(uuid4()),
                "values": openLlmObj.get_embeddings(analyzed_data),
                "metadata": {"path": file_path, "content": analyzed_data, "source": "PDF", "internet_url":inverse_download_info.get(file_path,'')}
            }
            if uploadType == "database":
                storage_result = pinecone_db.insert_data([data])
                print(f"DEBUG: Storage result: {storage_result}")
            i += 1
            answers.append(data)
            print(data["id"])
        except Exception as e:
            print(f"ERROR: Failed to process file '{file_path}'. Exception: {e}")
    return answers
