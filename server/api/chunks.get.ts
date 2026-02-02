import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

export default defineEventHandler(async (event) => {
  const text = await readBody(event);

  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 500,
    chunkOverlap: 100,
  });

  const docs = await splitter.createDocuments([text]);

  return docs;
});
