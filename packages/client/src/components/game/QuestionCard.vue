<script setup lang="ts">
import { computed } from 'vue'
import { useCountdown } from '@/composables/useCountdown'
import type { QuestionData } from '@/stores/game'
import TimerRing from './TimerRing.vue'

const props = defineProps<{
  question: QuestionData | null
  selectedIndex: number | null
  answeredCount: number
  totalPlayers: number
  currentRound: number
  totalRounds: number
}>()

const emit = defineEmits<{
  answer: [index: number]
}>()

const { remaining, progress } = useCountdown()

// Start countdown when question changes
if (props.question) {
  const endTime = Date.now() + props.question.timeLimitMs
  useCountdown().start(props.question.timeLimitMs, endTime)
}

const timeLeft = computed(() => {
  const secs = Math.ceil(remaining.value / 1000)
  return secs
})

const isTimeLow = computed(() => remaining.value < 5000)

const optionLabels = ['A', 'B', 'C', 'D']
</script>

<template>
  <div v-if="question" class="question-view anim-fade-in">
    <!-- Header -->
    <div class="question-header">
      <div class="round-info">
        第 {{ currentRound }} / {{ totalRounds }} 题
      </div>
      <TimerRing
        :progress="progress"
        :time-left="timeLeft"
      />
    </div>

    <!-- Question -->
    <div class="question-body">
      <p class="question-stem">{{ question.stem }}</p>
    </div>

    <!-- Options -->
    <div class="options-grid">
      <button
        v-for="(option, i) in question.options"
        :key="i"
        :class="[
          'option-btn',
          {
            selected: selectedIndex === i,
          },
        ]"
        :disabled="selectedIndex !== null"
        @click="emit('answer', i)"
      >
        <span class="option-letter">{{ optionLabels[i] }}</span>
        <span class="option-text">{{ option.replace(/^[A-D][.、]\s*/, '') }}</span>
      </button>
    </div>

    <!-- Footer -->
    <div class="question-footer">
      <span>{{ answeredCount }} / {{ totalPlayers }} 已作答</span>
    </div>
  </div>
</template>

<style scoped>
.question-view {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  padding: 16px;
}

.question-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 0 16px;
}

.round-info {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-secondary);
  background: var(--color-card);
  padding: 8px 16px;
  border-radius: 20px;
}

.question-body {
  background: var(--color-card);
  border-radius: var(--radius-lg);
  padding: 24px 20px;
  margin-bottom: 20px;
  box-shadow: var(--shadow);
}

.question-stem {
  font-size: 18px;
  font-weight: 600;
  line-height: 1.6;
}

.options-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  flex: 1;
}

.option-letter {
  font-size: 14px;
  font-weight: 700;
  color: var(--color-text-secondary);
  margin-right: 8px;
  min-width: 20px;
}

.option-text {
  font-size: 15px;
}

.question-footer {
  text-align: center;
  padding: 16px 0;
  font-size: 13px;
  color: var(--color-text-secondary);
}
</style>
