import { ref } from "vue";

export function useKeyframes(msPerFrame: number) {
  const animationKey = ref(0);
  setTimeout(() => animationKey.value++, msPerFrame);
  setTimeout(() => animationKey.value++, msPerFrame * 2);
  setTimeout(() => animationKey.value++, msPerFrame * 3);
  setTimeout(() => animationKey.value++, msPerFrame * 4);
  setTimeout(() => animationKey.value++, msPerFrame * 5);

  return { animationKey };
}
