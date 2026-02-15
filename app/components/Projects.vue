<script setup lang="ts">
const { items } = defineProps<{
  items: Project[];
}>();

const emit = defineEmits(["update"]);

onUpdated(() => {
  emit("update");
});

watch(
  () => items,
  () => {
    emit("update");
  },
);
</script>

<template>
  <div class="carousel carousel-end rounded-box w-full gap-2 sm:gap-0">
    <div
      v-for="item in items"
      :key="item.id"
      class="carousel-item w-48 cursor-pointer sm:w-64"
    >
      <div class="sm:hover-3d sm:scale-95">
        <div class="card bg-base-100 shadow-sm">
          <div class="card-body">
            <h2 class="card-title">{{ item.title }}</h2>
            <p>
              {{ item.description }}
            </p>
          </div>
          <figure v-if="item.image">
            <img
              class="max-h-[6rem] w-full object-cover sm:max-h-[13rem]"
              :src="item.image"
              :alt="item.title"
            />
          </figure>
        </div>

        <div />
        <div />
        <div />
        <div />
        <div />
        <div />
        <div />
        <div />
      </div>
    </div>
  </div>
</template>
