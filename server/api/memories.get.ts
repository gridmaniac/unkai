export default defineEventHandler(async () => {
  const memories = await Memory.find().sort({ dateFrom: -1 });

  return memories;
});
