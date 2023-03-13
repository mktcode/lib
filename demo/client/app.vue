<script setup lang="ts">
const isHome = computed(() => useRoute().path === '/')
</script>

<template>
  <div>
    <div v-if="!isHome" class="p-3">
      <NuxtLink class="text-blue" to="/">Lib</NuxtLink>
    </div>
    <NuxtPage />
  </div>
</template>