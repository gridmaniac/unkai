<script setup lang="ts">
const { memoryId } = useMemory();
const { deleteMemory } = useDeleteMemory();
</script>

<template>
  <div class="dropdown dropdown-end">
    <div tabindex="0" role="button" class="btn btn-ghost btn-circle btn-xl">
      <IconMoreHorizontalCircle01 class="size-6" />
    </div>
    <ul
      tabindex="0"
      class="dropdown-content menu bg-base-100 rounded-box z-1 w-48 p-2 shadow-sm"
    >
      <li @click="deleteMemory(memoryId)"><a>Delete memory</a></li>
    </ul>
  </div>
</template>
