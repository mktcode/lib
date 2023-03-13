<script setup lang="ts">
const accessToken = useState('accessToken', () => ref<string | null>(null))

const input = ref("");
const userName = ref("");
const repoName = ref("");

function scan() {
  userName.value = "";
  repoName.value = "";

  const [userNameInput, repoNameInput] = input.value.split("/");
  if (repoNameInput) {
    repoName.value = repoNameInput;
  }
  if (userNameInput) {
    userName.value = userNameInput;
  }
}
</script>

<template>
  <main class="flex flex-col items-center space-y-5 pt-24">
    <div v-if="accessToken" class="flex space-x-3">
      <input
        v-model="input"
        class="border rounded-lg p-3"
        placeholder="e.g. octocat or octokit/octokit.js"
      />
      <button @click="scan" class="border rounded-lg p-3">Scan</button>
    </div>
    <div v-else class="flex space-x-3">
      <ConnectGithub />
    </div>
    <Transition mode="out-in">
      <TeamCard
        v-if="userName && repoName"
        :owner="userName"
        :name="repoName"
      />
      <UserCard v-else-if="userName" :name="userName" />
    </Transition>
  </main>
</template>
