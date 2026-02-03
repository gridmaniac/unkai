import OpenAI from "openai";

export default defineEventHandler(async () => {
  const openai = new OpenAI({
    apiKey: process.env.OPEN_API_KEY,
  });

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    store: false,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: `Based on input extract json { dateFrom: ..., dateTo: ...} in ISOString format, now is ${new Date()} keep NULLs if some not specified`,
      },
      {
        role: "user",
        content: `Сделай резюме по последним 10 годам но только основные компании и проекты`,
      },
      // {
      //   role: "user",
      //   content: `Ты когда-нибудь ходил в караоке?`,
      // },
      // {
      //   role: "user",
      //   content: `Выдай резюме по всем компаниям где работал`,
      // },
    ],
  });

  return JSON.parse(response.choices[0]?.message.content || "{}");
});
