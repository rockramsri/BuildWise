import os
import json
from llm import LLM
from Pineconedb import PineconeVectorDB
from BuildWise.BuildWise.Backend.legal_Data_Retriever import LegalDataRetriever
from graph_generation import GraphGenerator
from AnalyseData import process_data

question_answering_llm = LLM(store_history=True)
question_rephrasing_llm = LLM()
pinecone_db = PineconeVectorDB()
pinecone_db_for_law = PineconeVectorDB(laws=True)
graph_generator = GraphGenerator()
law_retriever = LegalDataRetriever()

conversation_history = []
newly_uploaded_data = []

def get_answer(query: str):
    context = get_context(query)

    image_urls = graph_generator.data_to_graph(context, question_rephrasing_llm)

    full_prompt = f"""
    You are an AI designed to answer questions based on a given context. 
    Use only the information provided in the context to generate accurate and concise responses.
    Also use the chat history to answer if the question is a follow up question, else answer with just the immediate context provided.

    QUERY: {query}
    CONTEXT: {context['answer']}
    """

    result = question_answering_llm.answer(full_prompt)
    conversation_history.append(
        {
            "heading" : query,
            "content" : result.strip(),
            "images" : image_urls
        }
    )
    laws = law_retriever.get_refined_legal_data(query)
    response = {
        "message" : result.strip(),
        "images" : image_urls,
        "references" : context["reference"],
        "report" : None,
        "laws_information" : laws
    }
    return response

def get_context(query, iterations=2):
    answers = []
    if len(question_answering_llm.newly_uploaded_data) > 0:
        answers = question_answering_llm.newly_uploaded_data
    else:
        pinecone_answers = pinecone_db.query(query, top_k=5)
        answers = pinecone_answers["matches"]
    answer = ""
    references = []
    # print("retrieved documents : ", answers)
    for ans in answers:
        print(ans["id"])
        if ans["metadata"].get("content"):
            answer += ans["metadata"]["content"]
            if ans["metadata"].get("internet_url"):
                file_name = os.path.basename(ans["metadata"]["path"])
                references.append({"name" : file_name, "path" : ans["metadata"]["internet_url"]})
    if iterations == 0:
        return {
            "is_sufficient": False,
            "answer": answer,
            "reference" : references
        }
    prompt = (
        f"Here is a query: '{query}'\n"
        f"Here is the provided answer: '{answer}'\n"
        "Is the provided answer sufficient to fully address the query? "
        "If not, suggest what additional information is needed to make the answer complete. "
        "Additionally, if the answer is insufficient, provide a modified query that includes the missing information.\n"
        "Return the result as JSON in the format:\n"
        "{\n"
        "  \"is_sufficient\": true/false,\n"
        "  \"additional_info_needed\": \"details on what is missing, or empty if sufficient\",\n"
        "  \"modified_query\": \"a new version of the query that includes the missing information, or empty if sufficient\"\n"
        "}\n"
        "Ensure the response contains no extra text or explanations."
        "STRICTLY THE RESOPSE JSON ONLY {}, DON'T INCLUDE ```json```"
    )
    result = question_rephrasing_llm.answer(prompt)
    response = json.loads(result.strip())
    if response.get("is_sufficient", False):
        response['answer'] = answer
        response["reference"] = references
        return response
    return get_context(response.get("modified_query", query), iterations - 1)

def process_files(uploadType):
    question_answering_llm.newly_uploaded_data = process_data(uploadType)


# answers = get_context("New York", use_uploaded_data=True)
# print(type(answers))
# print(len(answers))