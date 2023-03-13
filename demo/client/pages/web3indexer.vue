<script setup lang="ts">
import { BrowserProvider, parseEther } from 'ethers'
import CONTRACT from '../../server/src/web3indexer/listeners/CONTRACT.json'

const { public: { web3IndexerUrl } } = useRuntimeConfig()

const graphqlDemoQuery = 'graphql?query={%0A%20 user (address%3A "0x27711f9c07230632F2EE1A21a967a9AC4729E520") {%0A%20%20%20 address%0A%20%20%20 unlocked%0A%20%20%20 amountPaid%0A%20%20%20 indexedAt%0A%20 }%0A}'

type UserInfo = {
  address: string
  unlocked: boolean
  amountPaid: number
  indexedAt: number
}

const userInfo = ref<UserInfo>({
  address: '',
  unlocked: false,
  amountPaid: 0,
  indexedAt: 0,
})

async function fetchUserInfo(address: string) {
  console.log(address)
  const users = await $fetch<{ [address: string]: UserInfo }>(`${web3IndexerUrl}/users`)

  if (users[address]) {
    userInfo.value = users[address]
  } else {
    userInfo.value = {
      address: '',
      unlocked: false,
      amountPaid: 0,
      indexedAt: 0,
    }
  }
}

const unlocking = ref(false)
async function unlock() {
  if (window.ethereum != null) {
    unlocking.value = true
    try {
      const provider = new BrowserProvider(window.ethereum)
      const signer = await provider.getSigner();
      const signerAddress = await signer.getAddress()

      await fetchUserInfo(signerAddress)

      if (userInfo.value.unlocked) {
        return
      }

      const tx = await signer.sendTransaction({
        to: CONTRACT.address,
        value: parseEther("0.1"),
      })
      await tx.wait()
      await new Promise(resolve => setTimeout(resolve, 3000))
      await fetchUserInfo(signerAddress)
      if (!userInfo.value.unlocked) {
        await new Promise(resolve => setTimeout(resolve, 3000))
        await fetchUserInfo(signerAddress)
      }
    } catch (e) {
      console.error(e)
    } finally {
      unlocking.value = false
    }
  }
}

const message = ref('');
const chatResponse = ref('');
const waitingForResponse = ref(false);

async function sendMessage() {
  if (waitingForResponse.value) return

  waitingForResponse.value = true

  try {
    const provider = new BrowserProvider(window.ethereum)
    const signer = await provider.getSigner();
    const signature = await signer.signMessage(message.value)
  
    chatResponse.value = await $fetch(`${web3IndexerUrl}/chat/${message.value}`, {
      headers: {
        'EOA-Signature': signature,
        'EOA-Signed-Message': message.value,
      },
    })
  } catch (e) {
    console.error(e)
  } finally {
    waitingForResponse.value = false
  }
}
</script>

<template>
  <main class="flex flex-col items-center space-y-5 pt-24">
    <div class="text-gray-600">Indexer running at:</div>
    <div class="font-bold">{{ web3IndexerUrl }}</div>
    <div class="flex">
      <div>
        <div>GraphQL</div>
        <div>Registered users</div>
        <div>Locked endpoint</div>
      </div>
      <div>
        <div class="text-right pl-5"><a :href="`${web3IndexerUrl}/${graphqlDemoQuery}`" target="_blank">/graphql</a></div>
        <div class="text-right pl-5"><a :href="`${web3IndexerUrl}/users`" target="_blank">/users</a></div>
        <div class="text-right pl-5"><a :href="`${web3IndexerUrl}/chat/some-message`" target="_blank">/chat/:message</a></div>
      </div>
    </div>
    <div v-if="unlocking" class="text-center">
      Unlocking...
    </div>
    <div v-else-if="userInfo.unlocked" class="text-center">
      <div>Chat endpoint unlocked!</div>
      <div>
        <input type="text" v-model="message" class="border border-gray-300 rounded p-2" />
      </div>
      <button @click="sendMessage" class="bg-blue-500 text-white rounded p-2">Send</button>
      <div>
        <div v-if="waitingForResponse">Waiting for response...</div>
        <div v-else-if="chatResponse">Response: {{ chatResponse }}</div>
      </div>
    </div>
    <div v-else class="text-center">
      <a href="#" @click="unlock">Unlock endpoint</a>
      <div class="text-sm text-gray-600">(requires MetaMask connected to Sepolia)</div>
    </div>
  </main>
</template>
