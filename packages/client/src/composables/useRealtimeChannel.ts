import { ref, onUnmounted } from 'vue'
import { supabase } from './useSupabase'
import { useGameStore } from '@/stores/game'
import { useAuthStore } from '@/stores/auth'
import type { GameBroadcastEvent } from '@/types'

export function useRealtimeChannel(inviteCode: string) {
  const gameStore = useGameStore()
  const authStore = useAuthStore()
  const isConnected = ref(false)
  const channel = ref<any>(null)

  async function subscribe() {
    const roomChannel = supabase.channel(`room:${inviteCode}`, {
      config: {
        broadcast: { self: true },
        presence: { key: authStore.user?.id || 'unknown' },
      },
    })

    roomChannel
      .on('broadcast', { event: 'countdown_tick' }, (payload) => {
        const event = payload.payload as GameBroadcastEvent
        if (event.type === 'countdown_tick') {
          gameStore.setCountdownTick(event.value)
        }
      })
      .on('broadcast', { event: 'round_start' }, (payload) => {
        const event = payload.payload as GameBroadcastEvent
        if (event.type === 'round_start') {
          gameStore.handleRoundStart({
            round: event.round,
            question: event.question,
            serverTime: event.serverTime,
          })
        }
      })
      .on('broadcast', { event: 'round_end' }, () => {
        // Inputs lock at round end - handled client-side by timer
      })
      .on('broadcast', { event: 'score_reveal' }, (payload) => {
        const event = payload.payload as GameBroadcastEvent
        if (event.type === 'score_reveal') {
          gameStore.handleScoreReveal({
            round: event.round,
            correctIndex: event.correctIndex,
            explanation: event.explanation,
            scores: event.scores,
          })
        }
      })
      .on('broadcast', { event: 'game_over' }, (payload) => {
        const event = payload.payload as GameBroadcastEvent
        if (event.type === 'game_over') {
          gameStore.handleGameOver({ finalScores: event.finalScores })
        }
      })
      .on('broadcast', { event: 'player_answered_count' }, (payload) => {
        const event = payload.payload as GameBroadcastEvent
        if (event.type === 'player_answered_count') {
          gameStore.setAnsweredCount(event.answered, event.total)
        }
      })
      .on('presence', { event: 'sync' }, () => {
        const state = roomChannel.presenceState()
        const allPlayers: any[] = []
        for (const key of Object.keys(state)) {
          const presences = state[key]
          if (presences && presences.length > 0) {
            allPlayers.push(presences[0])
          }
        }
        gameStore.setPlayers(
          allPlayers.map((p: any) => ({
            user_id: p.user_id || p.userId,
            nickname: p.nickname || p.nickName,
            avatar_url: p.avatar_url || p.avatarUrl,
            score: p.score || 0,
          }))
        )
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }: any) => {
        if (newPresences && newPresences.length > 0) {
          const p = newPresences[0]
          gameStore.addPlayer({
            user_id: p.user_id || p.userId || key,
            nickname: p.nickname || p.nickName || 'Player',
            avatar_url: p.avatar_url || p.avatarUrl || '',
            score: p.score || 0,
          })
        }
      })
      .on('presence', { event: 'leave' }, ({ key }: any) => {
        gameStore.removePlayer(key)
      })

    const status = await roomChannel.subscribe()
    const channelStatus = status as unknown as string
    isConnected.value = channelStatus === 'SUBSCRIBED'

    if (channelStatus === 'SUBSCRIBED' && authStore.user) {
      await roomChannel.track({
        userId: authStore.user.id,
        nickname: authStore.user.nickname,
        avatarUrl: authStore.user.avatar_url,
        score: 0,
        isHost: gameStore.isHost,
      })
    }

    channel.value = roomChannel
  }

  async function unsubscribe() {
    if (channel.value) {
      await channel.value.unsubscribe()
      channel.value = null
      isConnected.value = false
    }
  }

  onUnmounted(() => {
    unsubscribe()
  })

  return { isConnected, subscribe, unsubscribe }
}
