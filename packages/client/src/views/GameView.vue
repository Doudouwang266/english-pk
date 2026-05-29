<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useGameStore } from '@/stores/game'
import { useRealtimeChannel } from '@/composables/useRealtimeChannel'
import { setupWeChatShare } from '@/utils/wechat'
import LobbyPanel from '@/components/game/LobbyPanel.vue'
import CountdownOverlay from '@/components/game/CountdownOverlay.vue'
import QuestionCard from '@/components/game/QuestionCard.vue'
import ScoreRevealPanel from '@/components/game/ScoreRevealPanel.vue'
import GameOverPanel from '@/components/game/GameOverPanel.vue'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const gameStore = useGameStore()

const roomData = ref<any>(null)
const loading = ref(true)
const error = ref('')
const submitting = ref(false)

const { isConnected, subscribe, unsubscribe } = useRealtimeChannel(
  route.params.inviteCode as string
)

onMounted(async () => {
  if (!authStore.isLoggedIn) {
    sessionStorage.setItem('pk_redirect', route.fullPath)
    router.replace('/')
    return
  }

  await joinOrFetchRoom()
  setupWeChatShare(route.params.inviteCode as string)
})

onUnmounted(async () => {
  await unsubscribe()
  gameStore.reset()
})

async function joinOrFetchRoom() {
  loading.value = true
  error.value = ''

  try {
    const inviteCode = (route.params.inviteCode as string).toUpperCase()

    const joinRes = await fetch(`/api/rooms/${inviteCode}/join`, {
      method: 'POST',
      headers: authStore.getAuthHeaders(),
    })

    if (!joinRes.ok) {
      const data = await joinRes.json()
      throw new Error(data.error || '无法加入房间')
    }

    const data = await joinRes.json()
    roomData.value = data

    gameStore.setRoom({
      roomId: data.room.id,
      inviteCode: data.room.invite_code,
      isHost: data.room.host_user_id === authStore.user?.id,
      difficulty: data.room.difficulty,
    })
    gameStore.setPlayers(data.players || [])
    gameStore.phase = 'waiting'

    await subscribe()
  } catch (err: any) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}

async function handleStartGame() {
  submitting.value = true
  try {
    const res = await fetch(
      `/api/rooms/${route.params.inviteCode as string}/start`,
      {
        method: 'POST',
        headers: authStore.getAuthHeaders(),
      }
    )
    if (!res.ok) {
      const data = await res.json()
      throw new Error(data.error || 'Start failed')
    }
  } catch (err: any) {
    error.value = err.message
  } finally {
    submitting.value = false
  }
}

async function handleSubmitAnswer(index: number) {
  if (gameStore.myAnswer !== null) return

  const responseTimeMs = Date.now() - (gameStore.serverTimeOffset > 0
    ? Date.now() - gameStore.serverTimeOffset
    : Date.now())
  const elapsed = Date.now() - (Date.now() - gameStore.serverTimeOffset)
  const clientResponseTime = Date.now() - elapsed

  gameStore.selectAnswer(index)

  try {
    const res = await fetch(
      `/api/rooms/${route.params.inviteCode as string}/answer`,
      {
        method: 'POST',
        headers: authStore.getAuthHeaders(),
        body: JSON.stringify({
          selectedIndex: index,
          responseTimeMs: clientResponseTime,
        }),
      }
    )

    if (res.ok) {
      const data = await res.json()
      gameStore.setScoreResult(data)
    }
  } catch {
    // ignore network errors for answer submission
  }
}
</script>

<template>
  <div class="page game-page">
    <!-- Loading -->
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>加载房间...</p>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="error-state">
      <p class="error-text">{{ error }}</p>
      <button class="primary-btn" @click="router.push('/')">返回首页</button>
    </div>

    <!-- Game phases -->
    <template v-else>
      <LobbyPanel
        v-if="gameStore.phase === 'waiting'"
        :invite-code="roomData?.room.invite_code || ''"
        :is-host="gameStore.isHost"
        :players="gameStore.players"
        :loading="submitting"
        @start="handleStartGame"
      />

      <CountdownOverlay
        v-else-if="gameStore.phase === 'countdown'"
        :value="gameStore.countdownValue"
      />

      <QuestionCard
        v-else-if="gameStore.phase === 'answering'"
        :question="gameStore.currentQuestion"
        :selected-index="gameStore.myAnswer"
        :answered-count="gameStore.answeredCount"
        :total-players="gameStore.totalPlayers"
        :current-round="gameStore.currentRound"
        :total-rounds="gameStore.totalRounds"
        @answer="handleSubmitAnswer"
      />

      <ScoreRevealPanel
        v-else-if="gameStore.phase === 'score_reveal'"
        :scores="gameStore.roundScores"
        :correct-index="gameStore.lastScoreResult?.correctIndex ?? 0"
        :explanation="gameStore.lastScoreResult?.explanation ?? ''"
        :my-answer="gameStore.myAnswer"
        :points-earned="gameStore.lastScoreResult?.pointsEarned ?? 0"
        :current-round="gameStore.currentRound"
        :total-rounds="gameStore.totalRounds"
        :is-host="gameStore.isHost"
      />

      <GameOverPanel
        v-else-if="gameStore.phase === 'game_over'"
        :final-scores="gameStore.finalScores"
      />
    </template>
  </div>
</template>

<style scoped>
.game-page {
  padding: 0;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.loading-state,
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  gap: 16px;
  padding: 24px;
}

.spinner {
  width: 48px;
  height: 48px;
  border: 4px solid var(--color-border);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.error-text {
  color: var(--color-danger);
  font-size: 16px;
  text-align: center;
}

.primary-btn {
  padding: 12px 32px;
  border: none;
  border-radius: var(--radius);
  background: var(--color-primary);
  color: white;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
}
</style>
