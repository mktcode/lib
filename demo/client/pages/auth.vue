<script setup lang="ts">
const router = useRouter()
const route = useRoute()

const accessToken = useState('accessToken', () => ref<string | null>(null))
const githubUser = useState('githubUser', () => ref<GithubUser | null>(null))
const gettingAccessToken = useState('gettingAccessToken', () => ref(false))
const gettingUserData = ref(false)

onMounted(async () => {
  if (route.query.code) {
    gettingAccessToken.value = true
    const accessTokenInfo = await $fetch<{ access_token: string }>(
      '/auth/get-access-token',
      { query :{ code: route.query.code }}
    )
    
    gettingAccessToken.value = false
  
    if (accessTokenInfo) {
      accessToken.value = accessTokenInfo.access_token

      gettingUserData.value = true
      await new Promise((resolve) => setTimeout(resolve, 1000))
      githubUser.value = await $fetch<GithubUser>(`https://api.github.com/user`, {
        headers: {
          Authorization: `bearer ${accessToken.value}`
        }
      })
      gettingUserData.value = false
      router.push('/github')
    }
  }
})
</script>

<template>
  <div class="pt-24 flex justify-center items-center">
    <div v-if="gettingAccessToken">Getting access token...</div>
    <div v-else-if="gettingUserData">Getting user data...</div>
  </div>
</template>