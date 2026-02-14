<script setup lang="ts">
const router = useRouter();
const { query } = useRoute();
const activeMemory = ref<Memory>();

const { memory, memoryId, isLoading } = useMemory();
const {
  memories,
  debouncedSearch,
  page,
  hasNextPage,
  total,
  refetch,
  isPending,
} = useMemories();

const { stats } = useStats();
const { updateMemory } = useUpdateMemory();
const { shallowUpdateMemory } = useShallowUpdateMemory();

watch(memory, (newMemory) => {
  activeMemory.value = newMemory ? { ...newMemory } : undefined;
});

onMounted(() => {
  activeMemory.value = memory.value ? { ...memory.value } : undefined;
});

const setDate = () => {
  if (!activeMemory.value) return;
  activeMemory.value.dateTo = activeMemory.value?.dateTo
    ? null
    : new Date(new Date().toISOString().split("T")[0] || "");

  save();
};

const save = async () => {
  if (!memory.value || !activeMemory.value) return;
  if (!activeMemory.value.title || !activeMemory.value.text) return;
  if (
    memory.value.title === activeMemory.value.title &&
    memory.value.text === activeMemory.value.text &&
    memory.value.dateFrom === activeMemory.value.dateFrom &&
    memory.value.dateTo === activeMemory.value.dateTo
  )
    return;

  await updateMemory({ ...activeMemory.value });
};

const saveImage = async (image: string) => {
  if (!activeMemory.value) return;
  activeMemory.value.images.push(image);
  await shallowUpdateMemory(activeMemory.value);
};

const deleteImage = async (index: number) => {
  if (!activeMemory.value) return;
  activeMemory.value.images.splice(index, 1);
  await shallowUpdateMemory(activeMemory.value);
};

const bottomEl = useTemplateRef("bottom");
const listEl = useTemplateRef("list");
const containerEl = useTemplateRef("container");

debouncedSearch.value = (query.search as string) || "";

useIntersectionObserver(bottomEl, ([entry]) => {
  if (
    !entry?.isIntersecting ||
    !memories.value?.length ||
    !hasNextPage.value ||
    isPending.value
  )
    return;

  page.value++;
  refetch();

  listEl.value?.scrollTo({ top: listEl.value?.scrollHeight });
});

watch(debouncedSearch, () => {
  page.value = 1;
  listEl.value?.scrollTo({ top: 0 });

  // Update URL query parameter
  router.replace({
    query: {
      ...query,
      search: debouncedSearch.value || undefined,
    },
  });
});

onBeforeRouteUpdate(() => {
  window.persistedScrollTop = containerEl.value?.scrollTop;
});

onMounted(() => {
  if (import.meta.server) return;
  containerEl.value?.scrollTo({
    top: window.persistedScrollTop || 0,
  });
});
</script>

<template>
  <div class="flex h-screen">
    <div
      ref="container"
      class="max-h-screen w-full overflow-y-auto sm:block sm:max-w-lg"
      :class="{ hidden: !!memoryId }"
    >
      <div
        class="bg-base-100 rounded-box sticky top-2 z-10 m-2 flex items-center justify-between gap-4 p-2 opacity-90"
      >
        <label class="input input-ghost w-full">
          <IconSearch01 class="size-6" />
          <input v-model.trim="debouncedSearch" class="grow" />
          <span v-if="total" class="text-xs">{{ total }}</span>
          <kbd v-if="debouncedSearch" class="kbd" @click="debouncedSearch = ''"
            >×</kbd
          >
        </label>
      </div>

      <div class="divider divider-neutral text-xs">
        {{ stats?.totalSync }} / {{ stats?.total }}
      </div>

      <div v-if="isPending" class="flex flex-col gap-2 p-2">
        <div v-for="i in 7" :key="i" class="skeleton h-20 w-full" />
      </div>
      <ul v-else ref="list" class="menu w-full">
        <li v-for="item in memories" :key="item._id" class="w-full">
          <MemoryCard
            :memory="item"
            @click="navigateTo(`/memories/${item._id}`)"
          />
        </li>
        <li
          v-if="hasNextPage"
          ref="bottom"
          class="flex w-full items-center justify-center py-6"
        >
          <progress class="progress w-20" />
        </li>
      </ul>
    </div>
    <div
      class="relative flex flex-1 flex-col gap-4 p-4"
      :class="{ hidden: !memoryId }"
    >
      <div
        v-if="isLoading"
        class="absolute inset-0 flex items-center justify-center"
      >
        <span class="loading loading-bars loading-xl" />
      </div>

      <div v-if="activeMemory && !isLoading" class="flex items-center gap-4">
        <input
          v-model="activeMemory.title"
          type="text"
          class="input input-ghost input-xl w-full flex-1"
          @blur="save"
        />

        <div class="inline-grid *:[grid-area:1/1]">
          <div
            v-if="!activeMemory.requiresSync"
            class="status status-info animate-ping"
          />
          <div
            class="status"
            :class="{
              'status-info': !activeMemory.requiresSync,
              'status-neutral': activeMemory.requiresSync,
            }"
          />
        </div>

        <Menu />
      </div>

      <div v-if="activeMemory && !isLoading" class="flex gap-2">
        <input
          class="input input-ghost"
          type="date"
          :value="new Date(activeMemory.dateFrom).toISOString().split('T')[0]"
          @input="
            (event) => {
              const target = event.target as HTMLInputElement | null;
              if (target && target.value) {
                activeMemory!.dateFrom = new Date(target.value);
              }
            }
          "
          @blur="save"
        />
        <button class="btn btn-ghost" @click="setDate">
          <IconArrowRight04 v-if="activeMemory.dateTo" class="size-6" />
          <IconArrowLeft05 v-else class="size-6" />
        </button>
        <input
          v-if="activeMemory.dateTo"
          class="input input-ghost"
          type="date"
          :value="new Date(activeMemory.dateTo).toISOString().split('T')[0]"
          @input="
            (event) => {
              const target = event.target as HTMLInputElement | null;
              if (target && target.value) {
                activeMemory!.dateTo = new Date(target.value);
              }
            }
          "
          @blur="save"
        />
      </div>

      <textarea
        v-if="activeMemory && !isLoading"
        v-model="activeMemory.text"
        class="textarea textarea-ghost w-full flex-1 text-xl"
        @blur="save"
      />

      <Gallery
        v-if="activeMemory && !isLoading"
        :images="activeMemory?.images"
        @update="saveImage"
        @delete="deleteImage"
      />
    </div>
  </div>
</template>
