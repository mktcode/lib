<script setup lang="ts">
import TeamCardScore from "./TeamCardScore.vue";

function randomScore() {
  return Math.floor(Math.random() * 5) + 1;
}
</script>

<template>
  <div class="flex flex-col items-end text-gray-900 text-sm">
    <TeamCardScore
      label="Activity"
      :score="randomScore()"
      active-class="bg-lime-500"
    />
    <TeamCardScore
      label="Growth"
      :score="randomScore()"
      active-class="bg-cyan-500"
    />
    <TeamCardScore
      label="Popularity"
      :score="randomScore()"
      active-class="bg-violet-500"
    />
    <TeamCardScore
      label="Reputation"
      :score="randomScore()"
      active-class="bg-rose-500"
    />
  </div>
</template>
