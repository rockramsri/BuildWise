import requests
import logging

def create_embeddings(txt):
    try:
        url = "http://127.0.0.1:1234/v1/embeddings"
        headers = {"Content-Type": "application/json"}
        payload = {
            "model": "text-embedding-nomic-embed-text-v1.5",
            "input": txt
        }

        response = requests.post(url, headers=headers, json=payload)

        if response.status_code == 200:
            embedding = response.json()["data"][0]["embedding"]
            logging.info("Generated embedding successfully.")
            return embedding
        else:
            logging.error(
                "Embedding service error: %s, %s",
                response.status_code,
                response.text
            )
            return None

    except Exception as e:
        logging.error("Embedding creation error: %s", e)
        return None
