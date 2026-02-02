<script setup lang="ts">
const activeMemory = ref<Memory>();

const setDate = () => {
  if (!activeMemory.value) return;
  activeMemory.value.dateTo = activeMemory.value?.dateTo
    ? null
    : new Date(new Date().toISOString().split("T")[0] || "");

  save();
};

const { memories } = useMemories();
const { memory, memoryId, isLoading } = useMemory();
const { updateMemory } = useUpdateMemory();

watch(memory, (newMemory) => {
  activeMemory.value = newMemory;
});

onMounted(() => {
  activeMemory.value = memory.value;
});

const save = async () => {
  if (!activeMemory.value) return;
  await updateMemory({ ...activeMemory.value });
};

const saveImage = async (image: string) => {
  if (!activeMemory.value) return;
  activeMemory.value.images.push(image);
  await updateMemory(activeMemory.value);
};

const deleteImage = async (index: number) => {
  if (!activeMemory.value) return;
  activeMemory.value.images.splice(index, 1);
  await updateMemory(activeMemory.value);
};
</script>

<template>
  <div class="flex h-screen">
    <div
      class="sm:max-w-lg w-full max-h-screen overflow-y-auto sm:block"
      :class="{ hidden: !!memoryId }"
    >
      <div
        class="m-2 p-2 sticky top-2 bg-base-100 z-10 rounded-box opacity-90 flex justify-between items-center gap-4"
      >
        <label class="input input-ghost w-full">
          <IconSearch01 class="size-6" />
          <input type="search" class="grow" />
        </label>
      </div>
      <ul class="menu w-full">
        <li v-for="item in memories" :key="item._id">
          <MemoryCard :memory="item" @click="navigateTo(`/${item._id}`)" />
        </li>
      </ul>
    </div>
    <div
      class="flex-1 relative flex p-4 flex-col gap-4"
      :class="{ hidden: !memoryId }"
    >
      <div
        v-if="isLoading"
        class="absolute inset-0 flex justify-center items-center"
      >
        <span class="loading loading-bars loading-xl" />
      </div>

      <div v-if="activeMemory && !isLoading" class="flex items-center gap-4">
        <input
          v-model="activeMemory.title"
          type="text"
          class="input input-ghost w-full input-xl flex-1"
          @blur="save"
        />

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
