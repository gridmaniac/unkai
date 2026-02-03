import { Pinecone } from "@pinecone-database/pinecone";

export default defineEventHandler(async () => {
  const pc = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY || "",
  });

  const index = pc.index({ name: process.env.PINECONE_INDEX_NAME || "" });

  const results = await index.searchRecords({
    query: {
      topK: 5,
      inputs: { text: "Про Данила" },
      filter: {
        dateFrom: { $gte: 0 },
        dateTo: { $lte: 0 },
      },
    },
    rerank: {
      model: "bge-reranker-v2-m3",
      topN: 1,
      rankFields: ["text"],
    },
  });

  return results;
});
