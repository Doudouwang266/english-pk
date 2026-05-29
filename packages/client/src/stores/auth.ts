import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/composables/useSupabase'

export interface User {
  id: string
  wechat_openid: string
  nickname: string
  avatar_url: string
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const token = ref<string | null>(null)
  const loading = ref(false)

  const isLoggedIn = computed(() => !!token.value && !!user.value)

  function restoreSession() {
    const savedToken = localStorage.getItem('pk_token')
    const savedUser = localStorage.getItem('pk_user')
    if (savedToken && savedUser) {
      token.value = savedToken
      user.value = JSON.parse(savedUser)
      supabase.auth.setSession({ access_token: savedToken, refresh_token: '' })
    }
  }

  async function loginWithWechatCode(code: string) {
    loading.value = true
    try {
      const res = await fetch('/api/auth/wechat/code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      })

      if (!res.ok) throw new Error('Login failed')

      const data = await res.json()
      token.value = data.access_token
      user.value = data.user

      localStorage.setItem('pk_token', data.access_token)
      localStorage.setItem('pk_user', JSON.stringify(data.user))

      await supabase.auth.setSession({
        access_token: data.access_token,
        refresh_token: '',
      })
    } finally {
      loading.value = false
    }
  }

  async function loginAsGuest(nickname: string) {
    loading.value = true
    try {
      const res = await fetch('/api/auth/guest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nickname }),
      })

      if (!res.ok) throw new Error('Guest login failed')

      const data = await res.json()
      token.value = data.access_token
      user.value = data.user

      localStorage.setItem('pk_token', data.access_token)
      localStorage.setItem('pk_user', JSON.stringify(data.user))

      await supabase.auth.setSession({
        access_token: data.access_token,
        refresh_token: '',
      })
    } finally {
      loading.value = false
    }
  }

  function logout() {
    token.value = null
    user.value = null
    localStorage.removeItem('pk_token')
    localStorage.removeItem('pk_user')
  }

  function getAuthHeaders() {
    return token.value
      ? { Authorization: `Bearer ${token.value}`, 'Content-Type': 'application/json' }
      : { 'Content-Type': 'application/json' }
  }

  return { user, token, loading, isLoggedIn, restoreSession, loginWithWechatCode, loginAsGuest, logout, getAuthHeaders }
})
