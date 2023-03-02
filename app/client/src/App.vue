<script setup lang="ts">
import { useKeyframes } from "./composables/useKeyframes";

const { animationKey } = useKeyframes(200);
</script>

<template>
  <main class="flex flex-col items-center space-y-5 pt-24">
    {{  animationKey  }}
  </main>
</template>
