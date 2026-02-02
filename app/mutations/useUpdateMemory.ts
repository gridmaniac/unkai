export const useUpdateMemory = defineMutation(() => {
  const { mutateAsync: updateMemory, ...mutation } = useMutation({
    mutation: async (memory: Memory) => {
      await $fetch<string>("/api/memory", {
        method: "PUT",
        body: memory,
      });
    },
  });

  return {
    ...mutation,
    updateMemory,
  };
});
