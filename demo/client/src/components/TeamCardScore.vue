<script setup lang="ts">
import { useKeyframes } from "../composables/useKeyframes";

defineProps<{
  label: string;
  score: number;
  activeClass: string;
}>();

const { animationKey } = useKeyframes(100);
</script>

<template>
  <div class="flex items-center space-x-1">
    <span class="mr-2">{{ label }}</span>
    <div
      class="w-4 h-4 rounded transition-colors"
      :class="score > 0 && animationKey ? activeClass : 'bg-gray-100'"
    />
    <div
      class="w-4 h-4 rounded transition-colors"
      :class="score > 1 && animationKey > 1 ? activeClass : 'bg-gray-100'"
    />
    <div
      class="w-4 h-4 rounded transition-colors"
      :class="score > 2 && animationKey > 2 ? activeClass : 'bg-gray-100'"
    />
    <div
      class="w-4 h-4 rounded transition-colors"
      :class="score > 3 && animationKey > 3 ? activeClass : 'bg-gray-100'"
    />
    <div
      class="w-4 h-4 rounded transition-colors"
      :class="score > 4 && animationKey > 4 ? activeClass : 'bg-gray-100'"
    />
  </div>
</template>
