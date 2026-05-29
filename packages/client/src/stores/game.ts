import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export type GamePhase =
  | 'idle'
  | 'waiting'
  | 'countdown'
  | 'answering'
  | 'score_reveal'
  | 'game_over'

export interface PlayerInfo {
  user_id: string
  nickname: string
  avatar_url: string
  score: number
}

export interface QuestionData {
  id: string
  type: string
  stem: string
  mediaUrl: string | null
  options: string[]
  timeLimitMs: number
  roundNumber: number
  totalRounds: number
}

export const useGameStore = defineStore('game', () => {
  const phase = ref<GamePhase>('idle')
  const roomId = ref('')
  const inviteCode = ref('')
  const isHost = ref(false)
  const difficulty = ref('')

  const players = ref<PlayerInfo[]>([])
  const currentQuestion = ref<QuestionData | null>(null)
  const countdownValue = ref(3)

  const myAnswer = ref<number | null>(null)
  const answeredCount = ref(0)
  const totalPlayers = ref(0)
  const serverTimeOffset = ref(0)
  const roundEndTime = ref(0)

  const lastScoreResult = ref<{
    pointsEarned: number
    correctIndex: number
    explanation: string
  } | null>(null)

  const roundScores = ref<PlayerInfo[]>([])
  const finalScores = ref<PlayerInfo[]>([])

  const currentRound = computed(() => currentQuestion.value?.roundNumber || 0)
  const totalRounds = computed(() => currentQuestion.value?.totalRounds || 6)

  const isMyAnswerCorrect = computed(() => {
    if (myAnswer.value === null || !lastScoreResult.value) return null
    return myAnswer.value === lastScoreResult.value.correctIndex
  })

  const winner = computed(() => {
    if (finalScores.value.length === 0) return null
    return finalScores.value[0]
  })

  function setRoom(info: { roomId: string; inviteCode: string; isHost: boolean; difficulty: string }) {
    roomId.value = info.roomId
    inviteCode.value = info.inviteCode
    isHost.value = info.isHost
    difficulty.value = info.difficulty
  }

  function setPlayers(list: PlayerInfo[]) {
    players.value = list
    totalPlayers.value = list.length
  }

  function addPlayer(player: PlayerInfo) {
    if (!players.value.find((p) => p.user_id === player.user_id)) {
      players.value.push(player)
      totalPlayers.value = players.value.length
    }
  }

  function removePlayer(userId: string) {
    players.value = players.value.filter((p) => p.user_id !== userId)
    totalPlayers.value = players.value.length
  }

  function startCountdown() {
    phase.value = 'countdown'
    countdownValue.value = 3
  }

  function setCountdownTick(value: number) {
    countdownValue.value = value
  }

  function handleRoundStart(data: { round: number; question: QuestionData; serverTime: number }) {
    phase.value = 'answering'
    currentQuestion.value = data.question
    myAnswer.value = null
    answeredCount.value = 0
    lastScoreResult.value = null
    serverTimeOffset.value = Date.now() - data.serverTime
    roundEndTime.value = Date.now() + data.question.timeLimitMs
  }

  function selectAnswer(index: number) {
    if (myAnswer.value !== null) return
    myAnswer.value = index
  }

  function handleScoreReveal(data: {
    round: number
    correctIndex: number
    explanation: string
    scores: PlayerInfo[]
  }) {
    phase.value = 'score_reveal'
    roundScores.value = data.scores
  }

  function handleGameOver(data: { finalScores: PlayerInfo[] }) {
    phase.value = 'game_over'
    finalScores.value = data.finalScores
  }

  function setAnsweredCount(answered: number, total: number) {
    answeredCount.value = answered
    totalPlayers.value = total
  }

  function setScoreResult(result: { pointsEarned: number; correctIndex: number; explanation: string }) {
    lastScoreResult.value = result
  }

  function reset() {
    phase.value = 'idle'
    roomId.value = ''
    inviteCode.value = ''
    isHost.value = false
    currentQuestion.value = null
    players.value = []
    myAnswer.value = null
    lastScoreResult.value = null
    roundScores.value = []
    finalScores.value = []
  }

  return {
    phase,
    roomId,
    inviteCode,
    isHost,
    difficulty,
    players,
    currentQuestion,
    countdownValue,
    myAnswer,
    answeredCount,
    totalPlayers,
    serverTimeOffset,
    roundEndTime,
    lastScoreResult,
    roundScores,
    finalScores,
    currentRound,
    totalRounds,
    isMyAnswerCorrect,
    winner,
    setRoom,
    setPlayers,
    addPlayer,
    removePlayer,
    startCountdown,
    setCountdownTick,
    handleRoundStart,
    selectAnswer,
    handleScoreReveal,
    handleGameOver,
    setAnsweredCount,
    setScoreResult,
    reset,
  }
})
