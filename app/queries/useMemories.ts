export const useMemories = defineQuery(() => {
  const { data: memories, ...query } = useQuery({
    key: () => ["memories"],
    query: async () => {
      const memories = await $fetch<Memory[]>("/api/memories");

      return memories;
    },
  });

  return {
    memories,
    ...query,
  };
});
