export default defineEventHandler(async (event) => {
  const memoryId = getQuery(event).id as string;
  const memory = await Memory.findById(memoryId);

  return memory;
});
