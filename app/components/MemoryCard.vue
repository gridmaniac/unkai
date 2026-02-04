<script setup lang="ts">
const { memory } = defineProps<{
  memory: Memory;
}>();

const displayDate = computed(() => {
  const dateFromStr = new Date(memory.dateFrom)
    .toLocaleDateString()
    .replace(/\//g, ".");
  if (memory.dateTo) {
    return `${dateFromStr} - ${new Date(memory.dateTo).toLocaleDateString().replace(/\//g, ".")}`;
  }
  return dateFromStr;
});
</script>

<template>
  <div class="flex items-center justify-between gap-4 py-2">
    <div>
      <div class="line-clamp-1 text-lg font-semibold">
        {{ memory.title }}
      </div>
      <div class="text-base-content/60 line-clamp-2 text-sm break-all">
        <strong>{{ displayDate }}</strong> {{ memory.text }}
      </div>
    </div>
    <div class="flex flex-shrink-0 items-center gap-4">
      <img
        v-if="memory.images.length > 0"
        class="size-10 rounded"
        :src="memory.images[0]"
      />
      <div v-else class="bg-base-content/10 hidden size-10 rounded" />
      <IconArrowRight01 class="size-6" />
    </div>
  </div>
</template>
