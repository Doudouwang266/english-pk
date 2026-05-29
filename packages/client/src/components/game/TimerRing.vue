<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  progress: number
  timeLeft: number
}>()

const circumference = 2 * Math.PI * 28

const dashoffset = computed(() => {
  return circumference * (1 - props.progress)
})

const color = computed(() => {
  if (props.progress > 0.6) return '#22c55e'
  if (props.progress > 0.3) return '#f59e0b'
  return '#ef4444'
})
</script>

<template>
  <div class="timer-ring">
    <svg width="64" height="64" viewBox="0 0 64 64">
      <circle
        cx="32"
        cy="32"
        r="28"
        fill="none"
        stroke="var(--color-border)"
        stroke-width="4"
      />
      <circle
        cx="32"
        cy="32"
        r="28"
        fill="none"
        :stroke="color"
        stroke-width="4"
        stroke-linecap="round"
        :stroke-dasharray="circumference"
        :stroke-dashoffset="dashoffset"
        transform="rotate(-90 32 32)"
        style="transition: stroke-dashoffset 0.1s linear, stroke 0.3s"
      />
    </svg>
    <span class="timer-text" :style="{ color }">{{ timeLeft }}</span>
  </div>
</template>

<style scoped>
.timer-ring {
  position: relative;
  width: 64px;
  height: 64px;
}

.timer-text {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  font-weight: 800;
  font-variant-numeric: tabular-nums;
}
</style>
