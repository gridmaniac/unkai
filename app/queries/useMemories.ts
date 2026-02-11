export const useMemories = defineQuery(() => {
  const queryCache = useQueryCache();

  const debouncedSearch = ref("");
  const search = useDebounce(debouncedSearch, 500);
  const page = ref(1);
  const total = ref(0);
  const hasNextPage = ref(false);

  watch(search, (_, oldVal) => {
    queryCache.setQueryData(["memories", oldVal], []);
  });

  const { data: memories, ...query } = useQuery({
    key: () => ["memories", search.value],
    staleTime: 0,
    query: async () => {
      const data = await $fetch<Paginated<Memory[]>>("/api/memories", {
        params: {
          search: search.value,
          page: page.value,
        },
        headers: useRequestHeaders(),
      });

      const previousData = queryCache.getQueryData<Memory[]>([
        "memories",
        search.value,
      ]);

      hasNextPage.value = data.hasNextPage;
      total.value = data.total;

      return [
        ...(previousData ?? []),
        ...data.list.filter(
          (item) => !(previousData ?? []).some((p) => p._id === item._id),
        ),
      ];
    },
  });

  return {
    memories,
    debouncedSearch,
    page,
    hasNextPage,
    total,
    ...query,
  };
});
