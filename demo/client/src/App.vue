<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { GithubInsights } from "@mktcodelib/github-insights";
import { useKeyframes } from "./composables/useKeyframes";
import TeamCard from "./components/TeamCard.vue";
import UserCard from "./components/UserCard.vue";

const { animationKey } = useKeyframes(200);

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

onMounted(async () => {
  await new Promise((resolve) => setTimeout(resolve, 2000));

  try {
    if (repoName.value) {
      repoScan.value = await githubInsights.scanRepository(
        userName.value,
        repoName.value
      );
    } else {
      userScan.value = await githubInsights.scanUser(userName.value);
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
      <TeamCard v-if="repoScan && animationKey > 0" :repo-scan="repoScan" />
    </Transition>
    <Transition>
      <TeamCard v-if="repoScan && animationKey > 1" :repo-scan="repoScan" />
    </Transition>
    <Transition>
      <TeamCard v-if="repoScan && animationKey > 2" :repo-scan="repoScan" />
    </Transition>
    <Transition>
      <TeamCard v-if="repoScan && animationKey > 3" :repo-scan="repoScan" />
    </Transition>
  </main>
</template>
