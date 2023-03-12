<script setup lang="ts">
import { ref, watch } from "vue";
import { githubInsights } from "../lib/githubInsights";

const props = defineProps<{
  name: string;
}>();

const loadingData = ref(false);
const user = ref<{
  stargazerCount: number;
  forkCount: number;
  followersStargazerCount: number;
  followersForkCount: number;
  followersFollowerCount: number;
  mergedPullRequestCount: number;
  mergedPullRequestCount365d: number;
  mergedPullRequestCount30d: number;
}>();

watch(
  () => props.name,
  async () => {
    loadingData.value = true;
    try {
      user.value = await githubInsights.scanUser(props.name);
    } catch (error) {
      console.error(error);
    } finally {
      loadingData.value = false;
    }
  },
  { immediate: true }
);
</script>

<template>
  <div class="border rounded-lg p-3">
    <div v-if="user && !loadingData">
      <h1 class="text-3xl font-bold underline mb-10">
        Hello {{ props.name }}!
      </h1>

      <div class="max-w-sm text-center">
        <p>
          Your repositories have received
          <span class="font-bold">{{ user.stargazerCount }}</span> stars and
          have been forked
          <span class="font-bold">{{ user.forkCount }}</span> times.
        </p>

        <p>
          Your followers' repositories have received
          <span class="font-bold">{{ user.followersStargazerCount }}</span>
          stars and have been forked
          <span class="font-bold">{{ user.followersForkCount }}</span> times.
          <span class="font-bold">{{ user.followersFollowerCount }}</span>
          people follow your followers.
        </p>

        <p>
          You contributed
          <span class="font-bold">{{ user.mergedPullRequestCount }}</span>
          merged pull requests,
          <span class="font-bold">{{ user.mergedPullRequestCount365d }}</span>
          in the last year and
          <span class="font-bold">{{ user.mergedPullRequestCount30d }}</span>
          in the last 30 days.
        </p>
      </div>
    </div>

    <div v-else class="text-gray-500 animate-pulse border rounded-lg px-3 py-1">
      scanning user...
    </div>
  </div>
</template>
