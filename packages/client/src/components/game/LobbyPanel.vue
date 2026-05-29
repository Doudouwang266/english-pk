<script setup lang="ts">
import type { PlayerInfo } from '@/stores/game'

defineProps<{
  inviteCode: string
  isHost: boolean
  players: PlayerInfo[]
  loading: boolean
}>()

const emit = defineEmits<{
  start: []
}>()

async function copyInviteCode(code: string) {
  try {
    await navigator.clipboard.writeText(code)
  } catch {
    // Fallback
    const el = document.createElement('input')
    el.value = code
    document.body.appendChild(el)
    el.select()
    document.execCommand('copy')
    document.body.removeChild(el)
  }
  alert('房间号已复制！分享给微信好友吧')
}
</script>

<template>
  <div class="lobby">
    <div class="lobby-header">
      <h2 class="lobby-title">等待玩家加入</h2>
      <div class="room-code-display">
        <span class="code-label">房间号</span>
        <span class="code-value">{{ inviteCode }}</span>
        <button class="copy-btn" @click="copyInviteCode(inviteCode)">复制</button>
      </div>
      <p class="share-hint">将房间号或链接分享给微信好友</p>
    </div>

    <div class="player-grid">
      <div
        v-for="player in players"
        :key="player.user_id"
        class="player-card anim-scale-in"
      >
        <img :src="player.avatar_url" class="player-avatar" />
        <span class="player-name">{{ player.nickname }}</span>
        <span v-if="players.indexOf(player) === 0" class="host-badge">房主</span>
      </div>

      <div
        v-for="i in Math.max(0, 6 - players.length)"
        :key="'empty-' + i"
        class="player-card empty"
      >
        <div class="empty-avatar">?</div>
        <span class="player-name">等待中</span>
      </div>
    </div>

    <div class="lobby-footer">
      <p v-if="players.length < 2" class="min-players">
        至少需要2名玩家，当前 {{ players.length }} 人
      </p>
      <button
        v-if="isHost"
        class="start-btn"
        :disabled="players.length < 2 || loading"
        @click="emit('start')"
      >
        {{ loading ? '开始中...' : '开始PK' }}
      </button>
      <p v-else class="waiting-host">等待房主开始游戏...</p>
    </div>
  </div>
</template>

<style scoped>
.lobby {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  padding: 16px;
}

.lobby-header {
  text-align: center;
  padding: 24px 0 16px;
}

.lobby-title {
  font-size: 22px;
  font-weight: 700;
}

.room-code-display {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-top: 16px;
  padding: 16px;
  background: var(--color-card);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
}

.code-label {
  font-size: 14px;
  color: var(--color-text-secondary);
}

.code-value {
  font-size: 32px;
  font-weight: 800;
  letter-spacing: 6px;
  color: var(--color-primary);
}

.copy-btn {
  padding: 8px 16px;
  border: none;
  border-radius: var(--radius-sm);
  background: var(--color-primary);
  color: white;
  font-size: 14px;
  cursor: pointer;
}

.share-hint {
  margin-top: 12px;
  font-size: 14px;
  color: var(--color-text-secondary);
}

.player-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  padding: 24px 0;
  flex: 1;
}

.player-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 16px 8px;
  background: var(--color-card);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  position: relative;
}

.player-card.empty {
  opacity: 0.4;
}

.player-avatar {
  width: 52px;
  height: 52px;
  border-radius: 50%;
}

.empty-avatar {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  border: 2px dashed var(--color-border);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  color: var(--color-text-secondary);
}

.player-name {
  font-size: 13px;
  font-weight: 500;
  text-align: center;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 100%;
}

.host-badge {
  position: absolute;
  top: 4px;
  right: 4px;
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 8px;
  background: #fef3c7;
  color: #92400e;
}

.lobby-footer {
  text-align: center;
  padding: 16px 0 24px;
}

.min-players {
  font-size: 14px;
  color: var(--color-text-secondary);
  margin-bottom: 12px;
}

.start-btn {
  width: 100%;
  padding: 16px;
  border: none;
  border-radius: var(--radius);
  background: linear-gradient(135deg, #4f46e5, #7c3aed);
  color: white;
  font-size: 18px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
}

.start-btn:active {
  transform: scale(0.98);
}

.start-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.waiting-host {
  font-size: 15px;
  color: var(--color-text-secondary);
  padding: 16px;
}
</style>
