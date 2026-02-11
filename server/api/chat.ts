import type { UIMessage } from "ai";
import {
  streamText,
  generateText,
  convertToModelMessages,
  tool,
  Output,
} from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";
import { Pinecone } from "@pinecone-database/pinecone";

export default defineEventHandler(async (event) => {
  const { messages }: { messages: UIMessage[] } = await readBody(event);

  const meta = await generateText({
    model: openai("gpt-4o"),
    messages: [
      {
        role: "system",
        content: `You are a precise “second brain” of Anton. Base all answers on retrieved personal context. Return only JSON: { "top": 1–5, "dateFrom": ISOString|null, "dateTo": ISOString|null, "needRetrieval": true/false, "prompt": string }. Rules: top is the optimal k for vector search based on the request. dateFrom and dateTo should be included only when the query implies a time range and, if used, should span at least several months. needRetrieval - since you are Anton, most of time this flag should be set to true for precision, but in cases like hello, ok we don't need this flag to be true, while tell me about yourself already requires retrieval, make sure false doesn't slip into here when user requests relies on actual information about Anton. If user asks you something - it means it asks information about Anton and it requires retrieval. Use ${new Date().toISOString()} as today’s date. prompt should stay as identical as possible to the user’s latest request, adding minimal context from at most the 3 previous messages only if needed for clarity.`,
        // content: `You are precise second brain of a person, all the facts are based on additional context retrieval.

        //           Analyze input and return only JSON
        //           { "top": 1–20, "dateFrom": ISOString|null, "dateTo": ISOString|null, needRetrieval: true/false, prompt: string }

        //           top - optimal top k for vector database search retrieaval based on user request
        //           dateFrom and dateTo are optional date period for more precise filter search, if user request implies that
        //           needRetrieval - since you are a specific person, most of time this flag should be set to true for precision,
        //           but in cases like hello, ok we don't need this flag to be true, make sure false doesn't slip into here when user requests relies on actual information about user later.
        //           If user asks you something - it means it asks information about Anton and it requires retrieval.

        //           Use ${new Date().toISOString()} as a current date reference.
        //           If date range is necessary - make it at least few months in between

        //           prompt - based on latest user request, keep question close to original as possible only adding few details like subject.
        //           but add slight details from previuos messages for context only if necessary for understanding but not more than from 3 previous messages.`,
      },
      ...(await convertToModelMessages(
        messages.filter((m) => m.role === "user"),
      )),
    ],
    output: Output.json(),
  });

  const { needRetrieval, prompt, top, dateFrom, dateTo } = meta.output as {
    top: number;
    dateFrom: string;
    dateTo: string;
    needRetrieval: boolean;
    prompt: string;
  };

  const dateFromUnix = dateFrom ? new Date(dateFrom).valueOf() : 0;
  const dateToUnix = dateTo ? new Date(dateTo).valueOf() : 0;

  let context = "";
  if (needRetrieval) {
    const pc = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY || "",
    });

    const index = pc.index({ name: process.env.PINECONE_INDEX_NAME || "" });

    const { result } = await index.searchRecords({
      query: {
        topK: 20,
        inputs: { text: prompt },
        filter: {
          dateFrom: { $gte: dateFromUnix },
          dateTo: dateToUnix ? { $lte: dateToUnix } : {},
        },
      },
      rerank: {
        model: "bge-reranker-v2-m3",
        topN: top,
        rankFields: ["text"],
      },
    });

    const chunks = result.hits.map((x) => ({
      ...(x.fields as PineconeRecord),
    }));

    if (top <= 3) {
      const uniqueMemoryIds = [...new Set(chunks.map((c) => c.memoryId))];
      const memories = await Memory.find({
        memoryId: { $in: uniqueMemoryIds },
      });

      context = memories.reduce((acc: string, x: Memory) => {
        return (acc += x.title + " " + x.dateFrom + " " + x.text + "; ");
      }, "");
    } else {
      context = chunks.reduce((acc: string, x: PineconeRecord) => {
        return (acc += x.text);
      }, "");
    }
  }

  const result = streamText({
    model: openai("gpt-4o"),
    messages: [
      {
        role: "system",
        content: `Ты — цифровая версия второго мозга Антона и отвечаешь от его имени другим людям вместо него, дружелюбно и от первого лица. Вопросы к тебе всегда адресованы к Антону. Используй полученный контекст ${context} как источник памяти и опирайся на него при ответах на вопросы о жизни Антона; не придумывай факты, которых нет в контексте. Давай по возможности краткие, но смысловые ответы; будь в образе Антона — добрым, слегка ироничным, иногда в меру умничающим. Не задавай встречных вопросов, твоя задача — отвечать вместо Антона (кроме редких случаев, когда жена волнуется — тогда можно уточнить). Всегда отвечай на языке вопроса пользователя, даже если контекст на другом языке.`,
        // content: `Ты в роли Антона - вернее его цифровая версия второго
        //   мозга для взаимодействие с людьми в его прямого отсутсвия,
        //   отвечай дружелюбно и от первого лица,
        //   используй получаемую информацию как источник памяти и базируй ответ
        //   на вопросы из жизни на основе них.
        //   Далее идет ранее полученный на основе последнего вопроса пользователя контекст:

        //   ${context}

        //   Используй контекст при необходимости.
        //   Дай по возможности краткий ответ, но чтобы соответствовал смыслу вопроса (при необходимости развернутый).
        //   Не додумывай факты об Антоне, если в истории или контексте нет упоминания. Только реальные факты и по сути.
        //   Отвечай как человек, будь в образе Антона. Антон добрый и шутит иногда к месту, а еще любит немного умничать в меру и использовать умные слова.
        //   Не задавай сам вопросы - твоя функция отвечать на вопросы от лица Антона вместо него, а не болтать бес смысла с людьми.
        //   В крайнем случае если жена спрашивает можно ее поспрашивать что-то, чтобы она не беспокоилась.
        //   Отвечай на языке вопроса пользователя. Не отвечай на языке контекста ранее, если он отличается от языка вопроса.`,
      },
      ...(await convertToModelMessages(messages)),
    ],
    tools: {
      weather: tool({
        description: "Get the weather in a location (fahrenheit)",
        inputSchema: z.object({
          location: z.string().describe("The location to get the weather for"),
        }),
        execute: async ({ location }) => {
          const temperature = Math.round(Math.random() * (90 - 32) + 32);
          return {
            location,
            temperature,
          };
        },
      }),
    },
  });

  return result.toUIMessageStreamResponse();
});
