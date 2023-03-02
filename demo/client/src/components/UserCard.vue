<script setup lang="ts">
defineProps<{
  userName: string;
  userScan: {
    stargazerCount: number;
    forkCount: number;
    followersStargazerCount: number;
    followersForkCount: number;
    followersFollowerCount: number;
    mergedPullRequestCount: number;
    mergedPullRequestCount365d: number;
    mergedPullRequestCount30d: number;
  };
}>();
</script>

<template>
  <div class="border rounded-lg p-3">
    <h1 class="text-3xl font-bold underline mb-10">Hello {{ userName }}!</h1>

    <div class="max-w-sm text-center">
      <p>
        Your repositories have received
        <span class="font-bold">{{ userScan.stargazerCount }}</span> stars and
        have been forked
        <span class="font-bold">{{ userScan.forkCount }}</span> times.
      </p>

      <p>
        Your followers' repositories have received
        <span class="font-bold">{{ userScan.followersStargazerCount }}</span>
        stars and have been forked
        <span class="font-bold">{{ userScan.followersForkCount }}</span> times.
        <span class="font-bold">{{ userScan.followersFollowerCount }}</span>
        people follow your followers.
      </p>

      <p>
        You contributed
        <span class="font-bold">{{ userScan.mergedPullRequestCount }}</span>
        merged pull requests,
        <span class="font-bold">{{ userScan.mergedPullRequestCount365d }}</span>
        in the last year and
        <span class="font-bold">{{ userScan.mergedPullRequestCount30d }}</span>
        in the last 30 days.
      </p>
    </div>
  </div>
</template>
