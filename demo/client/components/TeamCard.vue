<script setup lang="ts">
import { GithubInsights } from "@mktcodelib/github-insights";

const accessToken = useState('accessToken', () => ref<string | null>(null))

const props = defineProps<{
  owner: string;
  name: string;
}>();

const numberFormatter = new Intl.NumberFormat("en-US", {
  notation: "compact",
  compactDisplay: "short",
});

const repoComits = ref<{
  commitCount: number;
  linesChanged: number;
  commitsByAuthor: Record<
    string,
    { commitCount: number; linesChanged: number }
  >;
  commitsByDay: Record<string, { commitCount: number; linesChanged: number }>;
  commitsByDayNormalized: {
    commitCount: number[];
    linesChanged: number[];
  };
}>();
const loadingData = ref(false);

const now = new Date();
const oneMonthAgo = new Date();
oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

watch(
  () => props.name,
  async () => {
    if (!accessToken.value) return;

    const githubInsights = new GithubInsights({ viewerToken: accessToken.value });

    loadingData.value = true;
    try {
      repoComits.value = await githubInsights.scanRepoCommits(
        props.owner,
        props.name,
        oneMonthAgo,
        now
      );
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
  <div class="border rounded-lg">
    <div v-if="repoComits && !loadingData" class="flex flex-col sm:flex-row">
      <div class="flex flex-col border-b sm:border-b-0 sm:border-r">
        <TeamCardMembers />
        <div
          class="flex justify-center space-x-1 text-xs text-gray-400 text-center p-3"
        >
          <span
            >{{
              Object.keys(repoComits.commitsByAuthor).length
            }}
            contributors</span
          >
          <span>&bullet;</span>
          <span
            >{{ numberFormatter.format(repoComits.commitCount) }} commits</span
          >
          <span>&bullet;</span>
          <span
            >{{ numberFormatter.format(repoComits.linesChanged) }} changes</span
          >
        </div>
        <TeamCardActivityChart
          class="mt-auto max-w-[280px]"
          :repo-scan="repoComits"
        />
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
    <div v-else class="text-gray-500 animate-pulse border rounded-lg px-3 py-1">
      scanning repo...
    </div>
  </div>
</template>
