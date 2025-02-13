from pinecone.grpc import PineconeGRPC as Pinecone
from BuildWise.BuildWise.Backend.llm_setup import LLM

class PineconeVectorDB:
    def __init__(self):
        self.pc = Pinecone(
            api_key="<API KEY>"
        )
        self.index = self.pc.Index("buildwise")
        self.embeddings_model = LLM()

    def query(self, query, top_k=10):
        embedded_query = self.embeddings_model.get_embeddings(query)
        results = self.index.query(
            vector=embedded_query,
            top_k=top_k,
            include_metadata=True
        )
        return results
