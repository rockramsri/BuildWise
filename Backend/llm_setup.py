import openai
import os
from dotenv import load_dotenv
from sentence_transformers import SentenceTransformer
import base64

load_dotenv()

class LLM:
    def __init__(self, model="gpt-4", store_history=False):
        self.model = model
        self.store_history = store_history
        self.embeddings_model = SentenceTransformer('all-Mpnet-base-v2')
        self.client = openai.OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
        self.conversation_history = []
        self.newly_uploaded_data = []

    def answer(self, prompt, temperature=0):
        if len(self.conversation_history) == 6:
            self.conversation_history.pop(0)
            self.conversation_history.pop(1)
        self.conversation_history.append({"role": "user", "content": prompt})
        if self.store_history:
            print('-------------conversation history----------------')
            print(self.conversation_history)
            print('-------------------------------------------------')
        response = self.client.chat.completions.create(
            model=self.model,
            messages=self.conversation_history,
            temperature=temperature,
        )
        answer = response.choices[0].message.content
        self.conversation_history.append({"role": "assistant", "content": response.choices[0].message.content})
        if not self.store_history:
            self.conversation_history = []
        return answer

    def get_embeddings(self, text):
        try:
            # Attempt to generate embeddings for the given text
            return self.embeddings_model.encode(text)
        except Exception as e:
            # Handle exceptions and log the error
            print(f"Error in generating embeddings: {e}")
            return None  # Return None or an appropriate fallback value

    def analyse_img(self, image_path):
        try:
            with open(image_path, "rb") as image_file:
                response = self.client.chat.completions.create(
                    model="gpt-4o",
                    messages=[
                        {
                            "role": "user",
                            "content": [
                                {
                                    "type": "text",
                                    "text": """You are a highly intelligent vision analysis system. Analyze the given image and provide the following:
1. If the image is a normal photo (e.g., scenery, objects, or people), describe the main objects, context, and overall scene in detail.
2. If the image contains a graph, chart, table, or similar visual representation of data, extract key numerical values, trends, and insights from the visual content.
3. Focus on providing concise, accurate descriptions or summaries, including any relevant numerical data for graphs or charts.

Image Analysis Instructions:
- For graphs or charts, identify axes labels, numerical ranges, peaks, troughs, and trends.
- For photos, describe objects, their relative positions, and any noticeable interactions or context.

Please analyze the image now."""
                                },
                                {
                                    "type": "image_url",
                                    "image_url": {
                                        "url": f"data:image/jpeg;base64,{base64.b64encode(image_file.read()).decode()}"
                                    }
                                }
                            ]
                        }
                    ],
                    max_tokens=500
                )
            return response.choices[0].message.content

        except Exception as e:
            return f"An error occurred: {e}"


if __name__ == "__main__":
    llm = LLM()
    image_path = "path/to/your/image.png"  # Replace with your image file path

    # Analyze the image
    result = llm.analyse_img(image_path)
    print("Image Analysis Result:")
    print(result)