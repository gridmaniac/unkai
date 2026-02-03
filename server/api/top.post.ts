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
        content: `Based on input decide what top rank is optimal in range 1-20. E.g. events or projects related is 5 be good, overview or opinion can be even 20 or lower, and just to the point can be 1. Return JSON like { top: ... }`,
      },
      // {
      //   role: "user",
      //   content: `Сдела резюме по последним 10 годам но только основные компании и проекты`,
      // },
      // {
      //   role: "user",
      //   content: `Ты когда-нибудь ходил в караоке?`,
      // },
      {
        role: "user",
        content: `Выдай резюме по всем компаниям где работал`,
      },
    ],
  });

  return JSON.parse(response.choices[0]?.message.content || "{}");
});
