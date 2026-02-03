export const useShallowUpdateMemory = defineMutation(() => {
  const queryCache = useQueryCache();

  const { mutateAsync: shallowUpdateMemory, ...mutation } = useMutation({
    mutation: async (memory: Memory) => {
      await $fetch<string>("/api/memory", {
        method: "PUT",
        query: {
          requiresSync: false,
        },
        body: memory,
      });

      queryCache.setQueryData(["memory", memory._id], memory);
    },
  });

  return {
    ...mutation,
    shallowUpdateMemory,
  };
});
