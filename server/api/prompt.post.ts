import OpenAI from "openai";
import { Pinecone } from "@pinecone-database/pinecone";

export default defineEventHandler(async (event) => {
  const { prompt, context } = await readBody(event);
  const openai = new OpenAI({
    apiKey: process.env.OPEN_API_KEY,
  });

  const datesResponse = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: `Analyze input and return only JSON { "top": 1–20, "dateFrom": ISOString|null, "dateTo": ISOString|null }, choosing top (1=точно, 5=проекты/события, 10–20=обзор/мнение), используя ${new Date().toISOString()} как “now” и разумно предполагая период дат, если возможно.`,
      },
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  const meta = JSON.parse(datesResponse.choices[0]?.message.content || "{}");
  const dateFrom = meta.dateFrom ? new Date(meta.dateFrom).valueOf() : 0;
  const dateTo = meta.dateTo ? new Date(meta.dateTo).valueOf() : 0;

  const pc = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY || "",
  });

  const index = pc.index({ name: process.env.PINECONE_INDEX_NAME || "" });

  const { result } = await index.searchRecords({
    query: {
      topK: 20,
      inputs: { text: prompt },
      filter: {
        dateFrom: { $gte: dateFrom },
        dateTo: dateTo ? { $lte: dateTo } : {},
      },
    },
    rerank: {
      model: "bge-reranker-v2-m3",
      topN: meta.top,
      rankFields: ["text"],
    },
  });

  const chunks = result.hits.map((x) => ({
    ...(x.fields as PineconeRecord),
  }));

  const text = chunks.reduce((acc, x) => {
    return (acc += x.text);
  }, "");

  const stream = await openai.chat.completions.create({
    model: "gpt-4o",
    stream: true,
    messages: [
      {
        role: "system",
        content: `Ты в роли Антона, отвечай дружелюбно и от первого лица, используй получаемую информацию как источник памяти и базируй ответ на вопросы из жизни на основе них. Не говори лишнюю личную информацию если не просят. Также вот история чата ранее для контекста: ${context}`,
      },
      {
        role: "user",
        content: `На основе вопроса "${prompt} и полученного факта "${text}" дай краткий ответ, но чтобы соответсвовал смыслу вопроса. Не выводи лишнюю информацию, не относящуюся к изначальному вопросу. Отвечай на языке вопроса"`,
      },
    ],
  });

  const webStream = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of stream) {
          const text = chunk.choices?.[0]?.delta?.content || "";
          if (text) {
            controller.enqueue(text);
          }
        }
        controller.close();
      } catch (err) {
        controller.error(err);
      }
    },
  });

  return sendStream(event, webStream);
});
