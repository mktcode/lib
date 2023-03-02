<script setup lang="ts">
import TeamCardMember from "./TeamCardMember.vue";
</script>

<template>
  <div class="flex items-center justify-center -space-x-3 px-5 pt-3">
    <TeamCardMember
      avatar-url="https://avatars.githubusercontent.com/u/75732239"
      class="z-0 w-12 h-12"
    />
    <TeamCardMember
      avatar-url="https://avatars.githubusercontent.com/u/6792578"
      class="z-10 w-14 h-14"
    />
    <TeamCardMember
      avatar-url="https://avatars.githubusercontent.com/u/28826387"
      class="z-20 w-16 h-16"
    />
    <TeamCardMember
      avatar-url="https://avatars.githubusercontent.com/u/93455288"
      class="z-10 w-14 h-14"
    />
    <TeamCardMember
      avatar-url="https://avatars.githubusercontent.com/u/72156679"
      class="z-0 w-12 h-12"
    />
  </div>
</template>
