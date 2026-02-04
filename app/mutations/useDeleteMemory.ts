export const useDeleteMemory = defineMutation(() => {
  const { mutateAsync: deleteMemory, ...mutation } = useMutation({
    mutation: async (memoryId: string) => {
      await $fetch("/api/memory", {
        method: "DELETE",
        query: {
          id: memoryId,
        },
      });
      navigateTo("/memories");
    },
  });

  return {
    ...mutation,
    deleteMemory,
  };
});
