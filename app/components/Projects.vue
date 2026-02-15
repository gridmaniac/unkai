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
  <div class="carousel carousel-end rounded-box w-full">
    <div
      v-for="item in items"
      :key="item.id"
      class="carousel-item w-52 cursor-pointer sm:w-64"
    >
      <div class="hover-3d scale-95">
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
