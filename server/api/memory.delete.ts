import { Pinecone } from "@pinecone-database/pinecone";

export default defineEventHandler(async (event) => {
  const memoryId = getQuery(event).id as string;
  const pc = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY || "",
  });

  const index = pc.index({ name: process.env.PINECONE_INDEX_NAME || "" });
  await index.deleteMany({
    filter: {
      memoryId: { $eq: memoryId },
    },
  });

  await Memory.findByIdAndDelete(memoryId);
});
