import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

export default defineEventHandler(async (event) => {
  const memory = await readBody(event);
  const requiresSync = getQuery(event).requiresSync as boolean;
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 500,
    chunkOverlap: 100,
  });

  const docs = await splitter.createDocuments([memory.text]);
  memory.chunks = docs.map((doc) => doc.pageContent);
  memory.requiresSync = requiresSync;

  await Memory.findByIdAndUpdate(memory._id, memory);
});
