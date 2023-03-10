<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { GithubInsights } from "@mktcodelib/github-insights";
import TeamCard from "./components/TeamCard.vue";
import UserCard from "./components/UserCard.vue";

const githubInsights = new GithubInsights({
  viewerToken: import.meta.env.VITE_GITHUB_TOKEN,
});

const urlHash = ref(window.location.hash.replace("#", "") || "mktcode");

const userName = computed(() => {
  const hash = urlHash.value;
  const username = hash.split("/")[0];
  return username;
});

const repoName = computed(() => {
  const hash = urlHash.value;
  const repo = hash.split("/")[1];
  return repo;
});

const loadingData = ref(true);
const userScan = ref<any>();
const repoScan = ref<any>();

const now = new Date();
const oneMonthAgo = new Date();
oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

onMounted(async () => {
  await new Promise((resolve) => setTimeout(resolve, 2000));

  try {
    if (repoName.value) {
      repoScan.value = await githubInsights.scanRepoCommits(
        userName.value,
        repoName.value,
        oneMonthAgo,
        now
      );
    } else {
      userScan.value = await githubInsights.scanUser(userName.value);
      const userScans = await githubInsights.scanUsers([
        userName.value,
        "rickkdev",
      ]);
      console.log(userScans);
    }
  } catch (error) {
    console.error(error);
  } finally {
    loadingData.value = false;
  }
});
</script>

<template>
  <main class="flex flex-col items-center space-y-5 pt-24">
    <div
      v-if="loadingData"
      class="text-gray-500 animate-pulse border rounded-lg px-3 py-1"
    >
      scanning submissions...
    </div>
    <Transition>
      <UserCard v-if="userScan" :user-name="userName" :user-scan="userScan" />
    </Transition>
    <Transition>
      <TeamCard v-if="repoScan" :repo-scan="repoScan" />
    </Transition>
  </main>
</template>
