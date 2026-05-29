<script setup lang="ts">
defineProps<{
  value: number
}>()
</script>

<template>
  <div class="countdown-overlay">
    <div class="countdown-content">
      <p class="countdown-label">游戏即将开始</p>
      <div class="countdown-number anim-count-pop" :key="value">
        {{ value }}
      </div>
    </div>
  </div>
</template>

<style scoped>
.countdown-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.countdown-content {
  text-align: center;
}

.countdown-label {
  color: rgba(255, 255, 255, 0.8);
  font-size: 18px;
  margin-bottom: 24px;
}

.countdown-number {
  font-size: 120px;
  font-weight: 900;
  color: white;
  text-shadow: 0 0 40px rgba(79, 70, 229, 0.5);
}
</style>
