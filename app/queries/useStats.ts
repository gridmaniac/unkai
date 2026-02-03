export const useStats = defineQuery(() => {
  const { data: stats, ...query } = useQuery({
    key: () => ["stats"],
    query: async () => {
      const stats = await $fetch<Stats>("/api/stats");
      return stats;
    },
  });

  return {
    stats,
    ...query,
  };
});
