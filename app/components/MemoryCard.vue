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
  <div class="flex justify-between items-center gap-4 py-2">
    <div>
      <div class="text-lg line-clamp-1 font-semibold">
        {{ memory.title }}
      </div>
      <div class="text-sm text-base-content/60 line-clamp-2">
        <strong>{{ displayDate }}</strong> {{ memory.text }}
      </div>
    </div>
    <div class="flex items-center gap-4 flex-shrink-0">
      <img
        v-if="memory.images.length > 0"
        class="size-10 rounded"
        :src="memory.images[0]"
      />
      <div v-else class="size-10 rounded bg-base-content/10" />
      <IconArrowRight01 class="size-6" />
    </div>
  </div>
</template>
