<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import type { PlayerInfo } from '@/stores/game'

const props = defineProps<{
  finalScores: PlayerInfo[]
}>()

const router = useRouter()
const showConfetti = ref(false)

onMounted(async () => {
  showConfetti.value = true
  try {
    const confetti = (await import('canvas-confetti')).default
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#4f46e5', '#f59e0b', '#22c55e', '#ef4444', '#7c3aed'],
    })
    setTimeout(() => {
      confetti({
        particleCount: 50,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
      })
      confetti({
        particleCount: 50,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
      })
    }, 300)
  } catch {
    // confetti not available, skip
  }
})

const medalColors = ['#fbbf24', '#94a3b8', '#f97316']
</script>

<template>
  <div class="game-over anim-fade-in">
    <!-- Winner -->
    <div class="winner-section" v-if="finalScores.length > 0">
      <div class="crown">👑</div>
      <img
        :src="finalScores[0].avatar_url"
        class="winner-avatar"
      />
      <h2 class="winner-name">{{ finalScores[0].nickname }}</h2>
      <p class="winner-score">{{ finalScores[0].score }}分 - 冠军！</p>
    </div>

    <!-- Podium (top 3) -->
    <div class="podium" v-if="finalScores.length >= 2">
      <div class="podium-item" v-for="(player, i) in finalScores.slice(0, 3)" :key="player.user_id">
        <img :src="player.avatar_url" class="podium-avatar" />
        <div
          class="podium-bar"
          :class="i === 0 ? 'gold' : i === 1 ? 'silver' : 'bronze'"
        >
          {{ i + 1 }}
        </div>
        <p class="podium-label">{{ player.nickname }}</p>
        <p class="podium-score">{{ player.score }}分</p>
      </div>
    </div>

    <!-- Full leaderboard -->
    <div class="leaderboard card">
      <h3>最终排名</h3>
      <div
        v-for="(player, i) in finalScores"
        :key="player.user_id"
        class="leader-row"
        :class="{ 'is-me': i === 0 }"
      >
        <span class="rank" :style="i < 3 ? { color: medalColors[i] } : {}">
          #{{ i + 1 }}
        </span>
        <img :src="player.avatar_url" class="avatar-sm" />
        <span class="name">{{ player.nickname }}</span>
        <span class="score">{{ player.score }}分</span>
      </div>
    </div>

    <!-- Actions -->
    <div class="game-over-actions">
      <button class="primary-btn" @click="router.push('/')">返回首页</button>
    </div>
  </div>
</template>

<style scoped>
.game-over {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  padding: 16px;
}

.winner-section {
  text-align: center;
  padding: 24px 0 8px;
}

.crown {
  font-size: 48px;
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

.winner-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  border: 3px solid #fbbf24;
  margin: 8px 0;
}

.winner-name {
  font-size: 22px;
  font-weight: 800;
}

.winner-score {
  font-size: 18px;
  color: #f59e0b;
  font-weight: 700;
}

.podium-avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
}

.podium-score {
  font-size: 14px;
  font-weight: 700;
  color: var(--color-primary);
}

.card {
  background: var(--color-card);
  border-radius: var(--radius);
  padding: 16px;
  margin-bottom: 16px;
  box-shadow: var(--shadow);
}

.leaderboard h3 {
  font-size: 16px;
  color: var(--color-text-secondary);
  margin-bottom: 12px;
}

.leader-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 0;
  border-bottom: 1px solid var(--color-border);
}

.leader-row:last-child {
  border-bottom: none;
}

.leader-row.is-me {
  background: #eef2ff;
  margin: 0 -16px;
  padding: 10px 16px;
  border-radius: var(--radius-sm);
}

.rank {
  font-size: 14px;
  font-weight: 700;
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

.game-over-actions {
  text-align: center;
  padding: 16px 0;
}

.primary-btn {
  width: 100%;
  padding: 14px;
  border: none;
  border-radius: var(--radius);
  background: var(--color-primary);
  color: white;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
}
</style>
