<script setup lang="ts">
const token = useCookie("token");
const { createMemory } = useCreateMemory();

const createNewMemory = async () => {
  const memoryId = await createMemory();
  navigateTo(`/memories/${memoryId}`);
};
</script>

<template>
  <div>
    <Waves />
    <Fireflies />
    <div>
      <slot />
    </div>

    <div v-if="token" class="fab fab-flower">
      <!-- a focusable div with tabindex is necessary to work on all browsers. role="button" is necessary for accessibility -->
      <div tabindex="0" role="button" class="btn btn-circle btn-lg">
        <IconMenu class="size-6" />
      </div>

      <!-- Main Action button replaces the original button when FAB is open -->
      <button class="fab-main-action btn btn-circle btn-lg btn-primary">
        <IconDiagonal class="size-6" />
      </button>

      <button
        class="btn btn-circle btn-lg"
        onclick="document.activeElement.blur()"
        @click="navigateTo('/memories')"
      >
        <IconListView class="size-6" />
      </button>
      <button
        class="btn btn-circle btn-lg"
        onclick="document.activeElement.blur()"
        @click="createNewMemory"
      >
        <IconAdd02 class="size-6" />
      </button>
      <button
        class="btn btn-circle btn-lg"
        onclick="document.activeElement.blur()"
        @click="navigateTo('/')"
      >
        <IconAiChat02 class="size-6" />
      </button>
    </div>
  </div>
</template>
