import OpenAI from "openai";

export default defineEventHandler(async (event) => {
  const openai = new OpenAI({
    apiKey: process.env.OPEN_API_KEY,
  });

  const stream = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    stream: true,
    messages: [
      {
        role: "user",
        content: `Краткий рассказ на 2 абзаца`,
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
