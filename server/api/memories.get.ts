const PAGE_SIZE = 20;

export default defineEventHandler(async (event) => {
  const { search, page = 1 } = getQuery(event);

  const query = {
    $or: [
      { title: { $regex: search, $options: "i" } },
      { text: { $regex: search, $options: "i" } },
    ],
  };

  const total = await Memory.countDocuments(query);
  const memories = await Memory.find(query)
    .sort({ dateFrom: -1 })
    .skip((Number(page) - 1) * PAGE_SIZE)
    .limit(PAGE_SIZE);

  return {
    list: memories,
    total,
    page: Number(page),
    pageSize: PAGE_SIZE,
    hasNextPage: total > Number(page) * PAGE_SIZE,
  };
});
