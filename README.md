🏗️ BuildWise – AI-Powered Conversational Assistant for Construction Tech

🚀 Finalist at ConTech 2025!
An AI-driven, RAG-based conversational assistant designed to optimize document processing, enhance legal compliance, and streamline construction management.

✨ Features & Capabilities

🔹 Conversational AI 🤖
	•	AI-powered chatbot designed for intelligent document retrieval and question answering.
	•	Uses RAG (Retrieval-Augmented Generation) to provide precise, context-aware responses.
	•	Query Optimization for improved accuracy and Context Enhancement for better results.

📑 AI-Powered Document Processing
	•	Extracts text, images, and numerical data from PDFs, legal documents, and reports.
	•	Converts unstructured information into structured insights.

📊 Graphical Data Visualization
	•	Automatically generates graphs & plots from extracted statistical/numerical data.
	•	AI-driven analysis to enhance decision-making.

📜 Legal Compliance & Policy Checker
	•	Extracts and analyzes legal regulations and policies from stored + live sources.
	•	Ensures documents comply with construction laws & expiry rules.

🔄 AI-Powered Report Generation
	•	Summarizes extracted data into visually appealing, structured reports.
	•	Supports editable and downloadable formats.

📁 Project Structure

📦 BuildWise  
│── Backend  
│   ├── API Setup  
│   │   ├── main.py  # Exposes API using FastAPI for frontend interactions  
│   │   ├── .env  # Stores API keys, LLM credentials, and database credentials  
│   │  
│   ├── Data Extraction  
│   │   ├── Dynamic Extracted Datas  
│   │   │   ├── download_info.json  # Metadata of downloaded documents  
│   │   │   ├── google_search_results.json  # Web-scraped data for legal compliance  
│   │   │   ├── links.csv  # List of extracted URLs for dynamic legal research  
│   │   ├── Uploaded

```markdown
│   │   │   ├── analyse_Data.py  # Handles uploaded PDFs for text/image extraction  
│   │   │   ├── dynamic_data_extraction.py  # Automates extraction & stores in Pinecone  
│   │   │   ├── scrape_Web.py  # Web scraping for real-time legal updates  
│   │   │   ├── storeLawsInVdb.py  # Stores structured legal info in vector DB  
│   │  
│   ├── Raw Datas  
│   │   ├── Images  
│   │   │   ├── Image_data.md  # Static image interaction logs  
│   │   ├── PDFs  
│   │   │   ├── Pdf_data.md  # Static PDF document metadata  
│   │  
│   ├── Utils  
│   │   ├── legal_Data_Retriever.py  # Fetches legal rules dynamically from the web  
│   │   ├── llm_setup.py  # LLM wrapper for sentence embeddings & custom functions  
│   │   ├── query_answering.py  # **Enhances query understanding & improves accuracy**  
│   │   │   📌 **Query Optimization** for relevant search retrieval  
│   │   │   📌 **Context Enhancement** to improve AI-generated responses  
│   │  
│── Frontend  
│   ├── (React.js UI with interactive dashboard & chatbot)  

🛠️ Tech Stack

Component	Tech Used
Frontend	React.js ⚛️
Backend API	FastAPI 🚀
Database	Pinecone & VectorDB 🔍
LLMs	OpenAI/GPT & Custom Sentence Embeddings 🧠
Data Processing	Python 🐍, Pandas, NumPy
Visualization	Matplotlib, Plotly 📊
Storage & Logs	JSON, CSV, Pinecone

📸 Screenshots & Demo

📌 GitHub Repo
🎥 Demo Video
📑 Presentation Slides

🚀 How to Run the Project

1️⃣ Clone the Repository

git clone https://your-github-repo-link.com
cd BuildWise

2️⃣ Install Dependencies

pip install -r requirements.txt

3️⃣ Set Up Environment Variables

Create a .env file and add:

OPENAI_API_KEY=your_openai_key
PINECONE_API_KEY=your_pinecone_key
DATABASE_URI=your_database_url

4️⃣ Run the Backend API

uvicorn Backend.API_Setup.main:app --reload

5️⃣ Start the Frontend

cd Frontend
npm install
npm start

📌 Future Improvements

✔️ Enhance RAG model for better retrieval accuracy
✔️ Expand legal compliance checker with more live sources
✔️ Add multilingual support for global adoption
✔️ Optimize query processing for even faster responses

💡 Open a pull request or start a discussion if you’d like to contribute! 🚀
