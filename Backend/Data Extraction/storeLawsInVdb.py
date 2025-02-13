import re
import json
from sentence_transformers import SentenceTransformer
import pinecone
from tqdm import tqdm
from llm import LLM
import requests
from Pineconedb import PineconeVectorDB

openLlmObj = LLM()
pinecone_db = PineconeVectorDB()

def clean_text(text):
    """Removes unwanted characters and normalizes whitespace."""
    text = re.sub(r"[^a-zA-Z0-9\s]", "", text)
    return re.sub(r"\s+", " ", text).strip()

def chunk_text(text, max_chunk_size=300, overlap_size=50):
    """
    Splits text into smaller chunks with overlap.

    Args:
        text (str): The input text to be chunked.
        max_chunk_size (int): Maximum size of each chunk (in words).
        overlap_size (int): Number of overlapping words between consecutive chunks.

    Returns:
        List[str]: List of text chunks with overlap.
    """
    words = text.split()
    step_size = max_chunk_size - overlap_size
    return [" ".join(words[i:i + max_chunk_size]) for i in range(0, len(words), step_size)]

def extract_relevant_points(text):

    prompt = f"""
You are an AI specialized in legal and construction data analysis. Your task is to extract only the essential legal and regulatory points related to construction laws, codes, and compliance requirements. Ignore general discussions, non-legal information, or irrelevant content.



INSTRUCTIONS:
- Identify any mentions of construction laws, regulations, codes, permits, or legal frameworks.
- If the text does not contain specific legal or regulatory information related to construction, return an empty string.
- Do NOT include general summaries, extra details, or unrelated content.
TEXT TO ANALYZE:

"""+text
    headers = {"Content-Type": "application/json"}
    payload = {
        "model": "meta-llama-3.1-8b-instruct",  # Ensure this matches your loaded model
        "prompt": prompt,
        "max_tokens": 512,
        "temperature": 0
    }
    url = "http://127.0.0.1:1234/v1/completions"

    try:
        response = requests.post(url, headers=headers, json=payload)
        response.raise_for_status()
        return response.json().get("choices", [{}])[0].get("text", "").strip()
    except requests.exceptions.RequestException as e:
        print(f"Error querying LM Studio: {e}")

def process_and_store_in_pinecone(json_url):

    # Fetch the JSON data
    with open(json_url, "r", encoding="utf-8") as f:
        data = json.load(f)

    # Process each query and its snippets
    for query, snippets in tqdm(data.items(), desc="Processing Queries"):
        for snippet in snippets:
            # Clean the snippet
            clean_snippet = clean_text(snippet)

            # Chunk the cleaned text
            chunks = chunk_text(clean_snippet)

            # Process each chunk with the LLM to extract relevant points
            for i, chunk in enumerate(chunks, 1):
                print("------------------------------------------------")
                print(chunks)
                print("+++++++++++++++++++++++++++++++++++++++++++++++++")
                relevant_points = extract_relevant_points(chunk)
                # print(relevant_points)
                # Prepsare and upsert data into Pinecone
                data = {
                    "id": f"law-{i}",
                    "values": openLlmObj.get_embeddings(relevant_points),
                    "metadata": {"content": relevant_points, "source": "Laws"}
                }
                print(data)
                storage_result = pinecone_db.insert_data([data])

    print("Data successfully stored in Pinecone.")

# Example Usage
if __name__ == "__main__":
    # URL to the JSON file
    json_url = "Data/google_search_results.json"  # Replace with your JSON file URL

    # Process and store data
    process_and_store_in_pinecone(json_url)
