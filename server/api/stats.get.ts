export default defineEventHandler(async () => {
  const total = await Memory.countDocuments();
  const totalSync = await Memory.countDocuments({ requiresSync: false });

  return { total, totalSync };
});
