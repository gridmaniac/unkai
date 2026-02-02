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
  <div class="flex gap-2">
    <button
      class="btn size-24 flex justify-center items-center btn-soft"
      @click="updateWithFile"
    >
      <IconImageUpload class="size-8" />
      <input ref="fileEl" type="file" hidden @change="onFileUpload" />
    </button>
    <div v-for="(image, index) in images" :key="image" class="avatar">
      <div class="w-24 rounded">
        <img :src="image" />
        <IconDelete02
          class="size-6 absolute bottom-2 right-2 cursor-pointer"
          @click="emit('delete', index)"
        />
      </div>
    </div>
  </div>
</template>
