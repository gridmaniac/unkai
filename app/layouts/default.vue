<script setup lang="ts">
const { createMemory } = useCreateMemory();

const createNewMemory = async () => {
  const memoryId = await createMemory();
  navigateTo(`/${memoryId}`);
};
</script>

<template>
  <div>
    <Waves />
    <Fireflies />
    <div>
      <slot />
    </div>
    <div class="fab">
      <button class="btn btn-lg btn-circle btn-soft" @click="createNewMemory">
        <IconAdd02 class="size-6" />
      </button>
    </div>
  </div>
</template>
