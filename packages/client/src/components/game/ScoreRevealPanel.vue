<script setup lang="ts">
import type { PlayerInfo } from '@/stores/game'

defineProps<{
  scores: PlayerInfo[]
  correctIndex: number
  explanation: string
  myAnswer: number | null
  pointsEarned: number
  currentRound: number
  totalRounds: number
  isHost: boolean
}>()

const emit = defineEmits<{
  next: []
}>()

const optionLabels = ['A', 'B', 'C', 'D']
</script>

<template>
  <div class="score-reveal anim-fade-in">
    <!-- Round header -->
    <div class="reveal-header">
      <p class="round-label">第 {{ currentRound }} / {{ totalRounds }} 题</p>
    </div>

    <!-- My result -->
    <div class="my-result" :class="{ correct: pointsEarned > 0 }">
      <div class="result-badge">
        {{ pointsEarned > 0 ? '✓' : '✗' }}
      </div>
      <div class="result-score anim-score-pop" v-if="pointsEarned > 0">
        +{{ pointsEarned }}
      </div>
      <div class="result-score incorrect" v-else>
        +0
      </div>
    </div>

    <!-- Correct answer -->
    <div class="correct-answer card">
      <p class="label">正确答案：{{ optionLabels[correctIndex] }}</p>
      <p class="explanation">{{ explanation }}</p>
    </div>

    <!-- Mini leaderboard -->
    <div class="mini-leaderboard card">
      <h4>当前排名</h4>
      <div
        v-for="(player, i) in scores.slice(0, 5)"
        :key="player.user_id"
        class="leader-row"
      >
        <span class="rank">#{{ i + 1 }}</span>
        <img :src="player.avatar_url" class="avatar-sm" />
        <span class="name">{{ player.nickname }}</span>
        <span class="score">{{ player.score }}分</span>
      </div>
    </div>

    <!-- Next -->
    <div class="reveal-footer">
      <p class="next-hint">准备下一题...</p>
    </div>
  </div>
</template>

<style scoped>
.score-reveal {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  padding: 16px;
}

.reveal-header {
  text-align: center;
  padding: 8px 0;
}

.round-label {
  font-size: 14px;
  color: var(--color-text-secondary);
  font-weight: 600;
}

.my-result {
  text-align: center;
  padding: 24px 0;
}

.result-badge {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  margin: 0 auto 12px;
  background: #fee2e2;
  color: var(--color-danger);
}

.my-result.correct .result-badge {
  background: #dcfce7;
  color: var(--color-success);
}

.result-score {
  font-size: 36px;
  font-weight: 900;
  color: var(--color-success);
}

.result-score.incorrect {
  color: var(--color-danger);
}

.card {
  background: var(--color-card);
  border-radius: var(--radius);
  padding: 16px;
  margin-bottom: 12px;
  box-shadow: var(--shadow);
}

.correct-answer .label {
  font-weight: 700;
  font-size: 16px;
  margin-bottom: 4px;
}

.correct-answer .explanation {
  color: var(--color-text-secondary);
  font-size: 14px;
  line-height: 1.5;
}

.mini-leaderboard h4 {
  font-size: 14px;
  color: var(--color-text-secondary);
  margin-bottom: 12px;
}

.leader-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 0;
  border-bottom: 1px solid var(--color-border);
}

.leader-row:last-child {
  border-bottom: none;
}

.rank {
  font-size: 14px;
  font-weight: 700;
  color: var(--color-primary);
  min-width: 28px;
}

.avatar-sm {
  width: 32px;
  height: 32px;
  border-radius: 50%;
}

.name {
  flex: 1;
  font-size: 14px;
  font-weight: 500;
}

.score {
  font-size: 16px;
  font-weight: 700;
  color: var(--color-primary);
}

.reveal-footer {
  text-align: center;
  padding: 16px 0;
}

.next-hint {
  font-size: 14px;
  color: var(--color-text-secondary);
}
</style>
