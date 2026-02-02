export default defineEventHandler(async () => {
  const memory = await Memory.create({
    title: "New Memory",
    dateFrom: new Date(),
  });

  return String(memory._id);
});
