<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { isWeChatBrowser, getWechatAuthUrl } from '@/utils/wechat'

const router = useRouter()
const authStore = useAuthStore()

const difficulty = ref<'easy' | 'medium' | 'hard'>('medium')
const joinCode = ref('')
const showCreate = ref(true)
const loading = ref(false)
const error = ref('')
const nickname = ref('')
const showNicknameInput = ref(false)

const difficultyLabel: Record<string, string> = {
  easy: '简单',
  medium: '中等',
  hard: '困难',
}

const inWechat = computed(() => isWeChatBrowser())

onMounted(() => {
  if (authStore.isLoggedIn) return

  if (isWeChatBrowser()) {
    window.location.href = getWechatAuthUrl()
  } else {
    showNicknameInput.value = true
  }
})

async function handleGuestLogin() {
  if (!nickname.value.trim()) return
  loading.value = true
  error.value = ''

  try {
    await authStore.loginAsGuest(nickname.value.trim())
    showNicknameInput.value = false
  } catch (err: any) {
    error.value = err.message || '登录失败'
  } finally {
    loading.value = false
  }
}

async function handleCreateRoom() {
  if (!authStore.isLoggedIn) return
  loading.value = true
  error.value = ''

  try {
    const res = await fetch('/api/rooms', {
      method: 'POST',
      headers: authStore.getAuthHeaders(),
      body: JSON.stringify({ difficulty: difficulty.value }),
    })

    if (!res.ok) {
      const data = await res.json()
      throw new Error(data.error || '创建房间失败')
    }

    const data = await res.json()
    router.push(`/room/${data.room.invite_code}`)
  } catch (err: any) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}

async function handleJoinRoom() {
  if (!joinCode.value.trim()) return
  loading.value = true
  error.value = ''

  try {
    const code = joinCode.value.trim().toUpperCase()
    const res = await fetch(`/api/rooms/${code}/join`, {
      method: 'POST',
      headers: authStore.getAuthHeaders(),
    })

    if (!res.ok) {
      const data = await res.json()
      throw new Error(data.error || '加入房间失败')
    }

    router.push(`/room/${code}`)
  } catch (err: any) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="page home-page">
    <!-- Header -->
    <div class="home-header">
      <h1 class="title">英语PK</h1>
      <p class="subtitle">和好友对战，看看谁的英语更好！</p>
      <div v-if="authStore.user" class="user-info">
        <img :src="authStore.user.avatar_url" class="user-avatar" />
        <span class="user-name">{{ authStore.user.nickname }}</span>
      </div>
    </div>

    <!-- Nickname input for guest login -->
    <div v-if="showNicknameInput && !authStore.isLoggedIn" class="card anim-fade-in">
      <h3 class="card-title">输入你的昵称</h3>
      <p class="card-desc">无需注册，立即开始PK</p>
      <input
        v-model="nickname"
        class="nickname-input"
        type="text"
        maxlength="12"
        placeholder="你的昵称"
        @keyup.enter="handleGuestLogin"
      />
      <button
        class="primary-btn"
        :disabled="!nickname.trim() || loading"
        @click="handleGuestLogin"
      >
        {{ loading ? '进入中...' : '开始PK' }}
      </button>
    </div>

    <!-- Main UI (after login) -->
    <template v-if="authStore.isLoggedIn">
      <!-- Error -->
      <div v-if="error" class="error-msg">{{ error }}</div>

      <!-- Tab switch -->
      <div class="tab-bar">
        <button
          :class="['tab-btn', { active: showCreate }]"
          @click="showCreate = true"
        >创建房间</button>
        <button
          :class="['tab-btn', { active: !showCreate }]"
          @click="showCreate = false"
        >加入房间</button>
      </div>

      <!-- Create Room -->
      <div v-if="showCreate" class="card anim-fade-in">
        <h3 class="card-title">选择难度</h3>
        <div class="difficulty-options">
          <button
            v-for="(label, key) in difficultyLabel"
            :key="key"
            :class="['diff-btn', { active: difficulty === key }]"
            @click="difficulty = key as any"
          >
            <span class="diff-icon">{{ key === 'easy' ? '😊' : key === 'medium' ? '🤔' : '🔥' }}</span>
            <span class="diff-label">{{ label }}</span>
          </button>
        </div>
        <button
          class="primary-btn"
          :disabled="loading"
          @click="handleCreateRoom"
        >
          {{ loading ? '创建中...' : '创建房间' }}
        </button>
      </div>

      <!-- Join Room -->
      <div v-if="!showCreate" class="card anim-fade-in">
        <h3 class="card-title">输入房间号</h3>
        <input
          v-model="joinCode"
          class="code-input"
          type="text"
          maxlength="6"
          placeholder="输入6位房间号"
          @input="joinCode = joinCode.toUpperCase()"
        />
        <button
          class="primary-btn"
          :disabled="loading || joinCode.length < 6"
          @click="handleJoinRoom"
        >
          {{ loading ? '加入中...' : '加入房间' }}
        </button>
      </div>
    </template>

    <!-- WeChat tip -->
    <div v-if="!inWechat && authStore.isLoggedIn" class="wechat-tip">
      <p>💡 复制当前页面链接，在微信中发给好友即可开始PK</p>
    </div>
  </div>
</template>

<style scoped>
.home-page {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.home-header {
  text-align: center;
  padding: 32px 0 16px;
}

.title {
  font-size: 36px;
  font-weight: 800;
  background: linear-gradient(135deg, #4f46e5, #7c3aed);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.subtitle {
  color: var(--color-text-secondary);
  margin-top: 8px;
  font-size: 14px;
}

.user-info {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 16px;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 2px solid var(--color-primary-light);
}

.user-name {
  font-size: 16px;
  font-weight: 600;
}

.error-msg {
  background: #fee2e2;
  color: var(--color-danger);
  padding: 12px;
  border-radius: var(--radius-sm);
  font-size: 14px;
  text-align: center;
}

.tab-bar {
  display: flex;
  background: var(--color-card);
  border-radius: var(--radius);
  padding: 4px;
}

.tab-btn {
  flex: 1;
  padding: 10px;
  border: none;
  border-radius: var(--radius-sm);
  background: transparent;
  font-size: 15px;
  font-weight: 500;
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all 0.2s;
}

.tab-btn.active {
  background: var(--color-primary);
  color: white;
}

.card {
  background: var(--color-card);
  border-radius: var(--radius-lg);
  padding: 20px;
  box-shadow: var(--shadow);
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 4px;
}

.card-desc {
  font-size: 13px;
  color: var(--color-text-secondary);
  margin-bottom: 16px;
}

.nickname-input {
  width: 100%;
  padding: 14px;
  border: 2px solid var(--color-border);
  border-radius: var(--radius);
  font-size: 18px;
  text-align: center;
  outline: none;
  margin-bottom: 16px;
  transition: border-color 0.2s;
}

.nickname-input:focus {
  border-color: var(--color-primary);
}

.difficulty-options {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
}

.diff-btn {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 16px 8px;
  border: 2px solid var(--color-border);
  border-radius: var(--radius);
  background: var(--color-card);
  cursor: pointer;
  transition: all 0.2s;
}

.diff-btn.active {
  border-color: var(--color-primary);
  background: #eef2ff;
}

.diff-icon {
  font-size: 28px;
}

.diff-label {
  font-size: 14px;
  font-weight: 600;
}

.code-input {
  width: 100%;
  padding: 14px;
  border: 2px solid var(--color-border);
  border-radius: var(--radius);
  font-size: 24px;
  text-align: center;
  letter-spacing: 8px;
  text-transform: uppercase;
  font-weight: 700;
  outline: none;
  margin-bottom: 16px;
  transition: border-color 0.2s;
}

.code-input:focus {
  border-color: var(--color-primary);
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
  transition: all 0.2s;
}

.primary-btn:active {
  transform: scale(0.98);
  opacity: 0.9;
}

.primary-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.wechat-tip {
  text-align: center;
  padding: 16px;
  font-size: 14px;
  color: var(--color-primary);
  background: #eef2ff;
  border-radius: var(--radius);
  line-height: 1.6;
}
</style>
