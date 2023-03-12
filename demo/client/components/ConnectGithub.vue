<script setup lang="ts">
const { public: { clientId } } = useRuntimeConfig()
</script>

<template>
  <a
    :href="`https://github.com/login/oauth/authorize?client_id=${clientId}`"
    class="flex items-center text-xl w-full text-center rounded-md bg-green-500 mt-4 mb-1 py-4 px-6 font-bold text-white transition-colors duration-300 hover:bg-green-600 focus:bg-green-700"
  >
    Connect with GitHub
  </a>
</template>