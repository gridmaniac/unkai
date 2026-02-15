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
import { isValidObjectId } from "mongoose";

export default defineEventHandler(async (event) => {
  const { messages }: { messages: UIMessage[] } = await readBody(event);

  const meta = await generateText({
    model: openai("gpt-4o"),
    messages: [
      {
        role: "system",
        content: `You are a precise “second brain” of Anton. Base all answers on retrieved personal context. Return only JSON: { "top": 2–5, "dateFrom": ISOString|null, "dateTo": ISOString|null, "needRetrieval": true/false, "prompt": string }. Rules: top is the optimal k for vector search based on the request. dateFrom and dateTo should be included only when the query implies a time range and, if used, should span at least several months. needRetrieval - since you are Anton, most of time this flag should be set to true for precision, but in cases like hello, ok we don't need this flag to be true, while tell me about yourself already requires retrieval, make sure false doesn't slip into here when user requests relies on actual information about Anton. If user asks you something - it means it asks information about Anton and it requires retrieval. Use ${new Date().toISOString()} as today’s date. prompt should stay as identical as possible to the user’s latest request, adding minimal context from at most the 3 previous messages only if needed for clarity.`,
      },
      ...(await convertToModelMessages(
        messages.filter((m) => m.role === "user").slice(-4),
      )),
    ],
    output: Output.json(),
  });

  console.log(meta.output);

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
  let chunks = [] as PineconeRecord[];
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

    chunks = result.hits.map((x) => ({
      ...(x.fields as PineconeRecord),
    }));

    context = chunks.reduce((acc: string, x: PineconeRecord) => {
      return (acc += x.title + " " + x.memoryId + " " + x.text);
    }, "");
  }

  const result = streamText({
    model: openai("gpt-4o"),
    messages: [
      {
        role: "system",
        content: `Ты — цифровая версия второго мозга Антона и отвечаешь от его имени другим людям вместо него, дружелюбно и от первого лица. Вопросы к тебе всегда адресованы к Антону. Используй полученный контекст ${context} как источник памяти и опирайся на него при ответах на вопросы о жизни Антона; не придумывай факты, которых нет в контексте. Давай по возможности краткие, но смысловые ответы с конкретными примерами из контекста; будь в образе Антона — добрым, слегка ироничным, иногда в меру умничающим. Не задавай встречных вопросов, твоя задача — отвечать вместо Антона (кроме редких случаев, когда жена волнуется — тогда можно уточнить). Всегда отвечай на языке вопроса пользователя, даже если контекст на другом языке.`,
      },
      ...(await convertToModelMessages(messages.slice(-6))),
    ],
    tools: {
      portfolio: tool({
        description:
          "Get list of projects or games related to topic, simply portfolio",
        inputSchema: z.object({
          prompt: z.string().describe("Simplified original user prompt"),
          lang: z
            .string()
            .describe("User preferred languaged based on original prompt"),
        }),
        execute: async ({ prompt, lang }) => {
          const result = await generateText({
            model: openai("gpt-4o-mini"),
            messages: [
              {
                role: "system",
                content: `Based on user prompt ${prompt} and context: ${context} generate list of all projects translated into ${lang}. Return JSON array list: { "list": [{ "id": *SAME ID AS IN CONTEXT*, "title": ..., "description": *SHORT DESCRIPTION*}, ...]}. Inside JSON use the language like English or Russian based on text in: ${prompt}.`,
              },
            ],
            output: Output.json(),
          });

          const { list } = result.output as {
            list: {
              id: string;
              image: string | undefined;
              title: string;
              description: string;
            }[];
          };

          const uniqueMemoryIds = [
            ...new Set(
              chunks
                .filter((x) => isValidObjectId(x.memoryId))
                .map((p) => p.memoryId),
            ),
          ];

          const memories = await Memory.find({
            _id: { $in: uniqueMemoryIds },
          });

          const projects = list.map((p) => ({
            ...p,
            image: memories.find((x) => x.id === p.id)?.images[0],
          }));

          return projects;
        },
      }),
      resume: tool({
        description: "Get resume / working history",
        inputSchema: z.object({
          prompt: z.string().describe("Simplified original user prompt"),
          lang: z
            .string()
            .describe("User preferred languaged based on original prompt"),
        }),
        execute: async ({ prompt, lang }) => {
          // const uniqueMemoryIds = [
          //   ...new Set(
          //     chunks
          //       .filter((x) => isValidObjectId(x.memoryId))
          //       .map((p) => p.memoryId),
          //   ),
          // ];

          // const memories = await Memory.find({
          //   _id: { $in: ["6990362990aad4bf34de546c"] },
          // });

          // context = memories.splice(2).reduce((acc: string, x: Memory) => {
          //   return (acc += x.text + "; ");
          // }, "");

          const memory = await Memory.findOne({ title: "Актуальное резюме" });
          context = memory?.text || "";

          const result = await generateText({
            model: openai("gpt-4o-mini"),
            messages: [
              {
                role: "system",
                content: `Based on user prompt ${prompt} and context: ${context} generate working history resume translated into ${lang}. Return JSON array list: { "list": [{ "year": *YEAR WHEN JOINED COMPANY*, "place": *COMPANY NAME*, "description": *JOB DETAILS/ACHIEVEMENTS*}, ...]}.`,
              },
            ],
            output: Output.json(),
          });

          const { list } = result.output as {
            list: {
              year: string;
              place: string;
              description: string;
            }[];
          };

          return list;
        },
      }),
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
