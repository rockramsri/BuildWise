from dotenv import load_dotenv
from BuildWise.BuildWise.Backend.llm_setup import LLM
from Pineconedb import PineconeVectorDB

load_dotenv()

# Initialize AI and Vector Database Objects
llm_model = LLM()
pinecone_db = PineconeVectorDB(laws=True)

class LegalDataRetriever:
    """Retrieves and refines legal data using vector databases and AI models."""

    def __init__(self, vector_db_url="http://localhost:6333", collection_name="legal_documents"):
        self.collection_name = collection_name

    def query_vector_db(self, search_text, top_k=5):

        try:
            # Generate embedding for the query
            print("search :",search_text)

            # Retrieve documents from the Pinecone vector database
            retrieved_data = pinecone_db.query(search_text)

            # Extract the "content" field from metadata
            extracted_texts = [doc["metadata"]["content"] for doc in retrieved_data.get("matches", []) if "metadata" in doc and "content" in doc["metadata"]]
            print(extracted_texts)
            return extracted_texts

        except Exception as e:
            print(f"Error retrieving data from the vector database: {e}")
            return []

    def refine_text_with_ai(self, retrieved_texts, query):

        try:
            if not retrieved_texts:
                return "No relevant legal data found."

            # Combine all retrieved snippets into a single context
            context = "\n\n".join(retrieved_texts)

            # Construct AI prompt
            prompt = f"""You are an AI legal assistant. Below are legal documents related to the query: "{query}".

            Based on the information provided, generate a well-structured, concise summary, highlighting:
            - Key legal points
            - Relevant statutes
            - Critical insights

            Retrieved Legal Documents:
            {context}

            Please provide a clear and professional summary:
            """
            print(prompt)
            return llm_model.answer(prompt, temperature=0.2)

        except Exception as e:
            print(f"Error summarizing text with AI: {e}")
            return "An error occurred while summarizing the retrieved data."

    def get_refined_legal_data(self, query):

        retrieved_data = self.query_vector_db(query)
        return self.refine_text_with_ai(retrieved_data, query)

# Example Usage
if __name__ == "__main__":
    retriever = LegalDataRetriever()
    search_query = "NYC building permit regulations"
    refined_summary = retriever.get_refined_legal_data(search_query)
    print("Final Refined Legal Summary:\n", refined_summary)