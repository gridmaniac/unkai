export const useCreateMemory = defineMutation(() => {
  const queryCache = useQueryCache();
  const { mutateAsync: createMemory, ...mutation } = useMutation({
    mutation: async () => {
      const memoryId = await $fetch<string>("/api/memory", {
        method: "POST",
      });

      queryCache.invalidateQueries({ key: ["memories"] });

      return memoryId;
    },
  });

  return {
    ...mutation,
    createMemory,
  };
});
