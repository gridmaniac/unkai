export default defineEventHandler((event) => {
  const url = getRequestURL(event).toString();
  const keywords = ["api/memory", "api/memories", "api/stats", "api/upload"];
  const cookies = parseCookies(event);
  const token = cookies?.token;

  if (keywords.some((word) => url.indexOf(word) !== -1)) {
    if (token !== process.env.AUTH_SECRET)
      throw createError({
        statusCode: 401,
      });
  }
});
