import type {
  IntegratedRecord,
  RecordMetadata,
} from "@pinecone-database/pinecone";
import { Pinecone } from "@pinecone-database/pinecone";

export default defineEventHandler(async () => {
  const pc = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY || "",
  });

  const memories = await Memory.find({ requiresSync: true }, null, {
    limit: 10,
  });

  const records = memories.reduce((acc, memory) => {
    memory.chunks.forEach((chunk, index) => {
      acc.push({
        id: memory._id + "+" + index,
        title: memory.title,
        text: chunk,
        memoryId: memory._id,
      });
    });
    return acc;
  }, [] as IntegratedRecord<RecordMetadata>[]);

  if (records.length === 0) {
    return null;
  }

  const index = pc.index("unkai");

  await index.upsertRecords({
    records,
  });

  for (const memory of memories) {
    memory.requiresSync = false;
    await memory.save();
  }

  return null;
});
