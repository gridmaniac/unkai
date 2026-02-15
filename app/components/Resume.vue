<script setup lang="ts">
const { items } = defineProps<{
  items: ResumeItem[];
}>();
</script>

<template>
  <ul
    class="timeline timeline-snap-icon max-md:timeline-compact timeline-vertical"
  >
    <template v-for="(item, index) in items?.toReversed()" :key="item.place">
      <li>
        <hr class="bg-primary" />
        <div class="timeline-middle">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            class="h-5 w-5"
          >
            <path
              fill-rule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
              clip-rule="evenodd"
            />
          </svg>
        </div>
        <div
          class="mb-10"
          :class="{
            'timeline-start md:text-end': !(index % 2),
            'timeline-end': index % 2,
          }"
        >
          <time class="font-mono italic">{{ item.year }}</time>
          <div class="text-lg font-black">{{ item.place }}</div>
          {{ item.description }}
        </div>
        <hr class="bg-primary" />
      </li>
      <!-- <li>
        <hr class="bg-primary" />
        <div class="timeline-middle">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            class="h-5 w-5"
          >
            <path
              fill-rule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
              clip-rule="evenodd"
            />
          </svg>
        </div>
        <div class="timeline-end md:mb-10">
          <time class="font-mono italic">1998</time>
          <div class="text-lg font-black">iMac</div>
          iMac is a family of all-in-one Mac desktop computers designed and
          built by Apple Inc. It has been the primary part of Apple's consumer
          desktop offerings since its debut in August 1998, and has evolved
          through seven distinct forms
        </div>
        <hr class="bg-primary" />
      </li> -->
    </template>
  </ul>
</template>
