export default defineEventHandler(async (event) => {
  const memoryId = getQuery(event).id as string;
  await Memory.findByIdAndDelete(memoryId);
});
