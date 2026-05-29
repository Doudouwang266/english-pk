<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { verifyState } from '@/utils/wechat'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const statusMsg = ref('正在登录...')

onMounted(async () => {
  const code = route.query.code as string
  const state = route.query.state as string

  if (!code) {
    statusMsg.value = '授权失败：缺少code参数'
    return
  }

  if (!verifyState(state)) {
    statusMsg.value = '安全验证失败，请重新登录'
    return
  }

  try {
    await authStore.loginWithWechatCode(code)
    statusMsg.value = '登录成功！'

    const redirect = sessionStorage.getItem('pk_redirect')
    sessionStorage.removeItem('pk_redirect')
    router.replace(redirect || '/')
  } catch (err: any) {
    statusMsg.value = `登录失败: ${err.message}`
  }
})
</script>

<template>
  <div class="page auth-page">
    <div class="auth-card">
      <div class="spinner"></div>
      <p class="auth-status">{{ statusMsg }}</p>
    </div>
  </div>
</template>

<style scoped>
.auth-page {
  display: flex;
  align-items: center;
  justify-content: center;
}

.auth-card {
  text-align: center;
  padding: 48px 24px;
}

.spinner {
  width: 48px;
  height: 48px;
  border: 4px solid var(--color-border);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.auth-status {
  color: var(--color-text-secondary);
  font-size: 16px;
}
</style>
