<script setup lang="ts">
import TeamCardScores from "./TeamCardScores.vue";
import TeamCardMembers from "./TeamCardMembers.vue";
import TeamCardActivityChart from "./TeamCardActivityChart.vue";
</script>

<template>
  <div class="border rounded-lg">
    <div class="flex flex-col sm:flex-row">
      <div class="flex flex-col border-b sm:border-b-0 sm:border-r">
        <TeamCardMembers />
        <div
          class="flex justify-center space-x-1 text-xs text-gray-400 text-center p-3"
        >
          <span>7 contributors</span>
          <span>&bullet;</span>
          <span>54 commits</span>
          <span>&bullet;</span>
          <span>1.5k changes</span>
        </div>
        <TeamCardActivityChart class="mt-auto max-w-[280px]" />
      </div>
      <div class="px-5 py-3">
        <div class="font-bold text-right text-gray-900">
          Submission to hackathon
        </div>
        <div class="text-right text-xs text-gray-400 mb-3">
          OpenQDev/OpenQ-Frontend
        </div>
        <TeamCardScores />
      </div>
    </div>
  </div>
</template>
