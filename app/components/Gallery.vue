<script setup lang="ts">
defineProps<{
  images?: string[];
}>();

const emit = defineEmits<{
  (e: "update", image: string): void;
  (e: "delete", index: number): void;
}>();

const fileEl = useTemplateRef("fileEl");

const updateWithFile = () => {
  fileEl.value?.click();
};

const { onFileUpload } = useFileUpload(async (base64: string) => {
  try {
    const result = await $fetch("/api/upload", {
      method: "POST",
      body: JSON.stringify({ file: base64 }),
      headers: { "Content-Type": "application/json" },
    });

    emit("update", result);
  } catch (error) {
    console.error("Failed to upload file:", error);
  }
});
</script>

<template>
  <div class="flex max-h-[15rem] flex-wrap gap-2 overflow-auto">
    <button
      class="btn btn-soft flex size-16 items-center justify-center sm:size-24"
      @click="updateWithFile"
    >
      <IconImageUpload class="size-8" />
      <input ref="fileEl" type="file" hidden @change="onFileUpload" />
    </button>
    <div v-for="(image, index) in images" :key="image" class="avatar">
      <div class="w-16 rounded sm:w-24">
        <a :href="image" target="_blank"
          ><img class="cursor-alias" :src="image"
        /></a>
        <IconDelete02
          class="absolute right-2 bottom-2 size-4 cursor-pointer sm:size-6"
          @click="emit('delete', index)"
        />
      </div>
    </div>
  </div>
</template>
