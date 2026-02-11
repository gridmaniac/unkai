export const useMemory = defineQuery(() => {
  const route = useRoute();
  const memoryId = computed(() => route.params.id as string);

  const { data: memory, ...query } = useQuery({
    key: () => ["memory", memoryId.value],
    enabled: () => !!memoryId.value,
    query: async () => {
      const memory = await $fetch<Memory>("/api/memory", {
        params: {
          id: memoryId.value,
        },
        headers: useRequestHeaders(),
      });

      return memory;
    },
  });

  return {
    memory,
    memoryId,
    ...query,
  };
});
