export const useUpdateMemory = defineMutation(() => {
  const queryCache = useQueryCache();

  const { mutateAsync: updateMemory, ...mutation } = useMutation({
    mutation: async (memory: Memory) => {
      await $fetch<string>("/api/memory", {
        method: "PUT",
        query: {
          requiresSync: true,
        },
        body: memory,
      });

      queryCache.setQueryData(["memory", memory._id], memory);
      queryCache.invalidateQueries({ key: ["memories"] });
    },
  });

  return {
    ...mutation,
    updateMemory,
  };
});
