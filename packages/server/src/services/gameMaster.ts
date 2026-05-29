import { supabaseAdmin } from '../supabase/client.js'
import { calculatePoints, verifyResponseTime } from './scoring.js'
import type { GameBroadcastEvent, PlayerScoreSnapshot, QuestionPublic, RoomPlayer } from '../types/index.js'

interface GameLoopState {
  roomId: string
  currentRound: number
  totalRounds: number
  roundTimer: ReturnType<typeof setTimeout> | null
  scoreRevealTimer: ReturnType<typeof setTimeout> | null
  answeredThisRound: Set<string>
  playerCount: number
  questionIds: string[]
}

class GameLoop {
  private state: GameLoopState

  constructor(
    private roomId: string,
    questionIds: string[],
    playerCount: number
  ) {
    this.state = {
      roomId,
      currentRound: 0,
      totalRounds: questionIds.length,
      roundTimer: null,
      scoreRevealTimer: null,
      answeredThisRound: new Set(),
      playerCount,
      questionIds,
    }
  }

  private getChannel() {
    return activeRooms.get(this.roomId)?.channel || null
  }

  private async broadcast(event: GameBroadcastEvent) {
    const channel = this.getChannel()
    if (channel) {
      await channel.send({
        type: 'broadcast',
        event: event.type,
        payload: event as any,
      })
    }
  }

  async begin() {
    await supabaseAdmin
      .from('rooms')
      .update({ status: 'countdown' })
      .eq('id', this.roomId)

    for (let i = 3; i >= 1; i--) {
      await this.broadcast({ type: 'countdown_tick', value: i })
      await this.sleep(1000)
    }

    await supabaseAdmin
      .from('rooms')
      .update({ status: 'playing' })
      .eq('id', this.roomId)

    await this.startRound(1)
  }

  async startRound(round: number) {
    this.state.currentRound = round
    this.state.answeredThisRound.clear()

    const question = await this.getQuestion(round)
    if (!question) {
      await this.endGame()
      return
    }

    const timeLimit = question.time_limit_ms
    const serverTime = Date.now()

    await supabaseAdmin
      .from('rooms')
      .update({
        current_round: round,
        round_started_at: new Date(serverTime).toISOString(),
        round_ends_at: new Date(serverTime + timeLimit).toISOString(),
      })
      .eq('id', this.roomId)

    const publicQuestion: QuestionPublic = {
      id: question.id,
      type: question.type,
      stem: question.stem,
      mediaUrl: question.media_url,
      options: question.options,
      timeLimitMs: timeLimit,
      roundNumber: round,
      totalRounds: this.state.totalRounds,
    }

    await this.broadcast({
      type: 'round_start',
      round,
      question: publicQuestion,
      serverTime,
    })

    this.state.roundTimer = setTimeout(() => this.endRound(), timeLimit)
  }

  async processAnswer(
    userId: string,
    selectedIndex: number,
    clientResponseTimeMs: number
  ) {
    if (this.state.answeredThisRound.has(userId)) {
      return null
    }

    const round = this.state.currentRound
    const questionId = this.state.questionIds[round - 1]

    const { data: room } = await supabaseAdmin
      .from('rooms')
      .select('round_started_at')
      .eq('id', this.roomId)
      .single()

    const verifiedTime = verifyResponseTime(clientResponseTimeMs, room?.round_started_at || null)

    const { data: question } = await supabaseAdmin
      .from('questions')
      .select('correct_index, time_limit_ms, explanation')
      .eq('id', questionId)
      .single()

    if (!question) return null

    const isCorrect = selectedIndex === question.correct_index
    const points = calculatePoints(verifiedTime, isCorrect, question.time_limit_ms)

    this.state.answeredThisRound.add(userId)

    await supabaseAdmin.from('answers').insert({
      room_id: this.roomId,
      user_id: userId,
      question_id: questionId,
      round_number: round,
      selected_index: selectedIndex,
      is_correct: isCorrect,
      response_time_ms: Math.round(verifiedTime),
      points_earned: points,
    })

    if (points > 0) {
      await supabaseAdmin.rpc('add_player_score', {
        p_room_id: this.roomId,
        p_user_id: userId,
        p_score: points,
        p_response_time_ms: Math.round(verifiedTime),
      })
    }

    await this.broadcast({
      type: 'player_answered_count',
      round,
      answered: this.state.answeredThisRound.size,
      total: this.state.playerCount,
    })

    if (this.state.answeredThisRound.size >= this.state.playerCount) {
      if (this.state.roundTimer) {
        clearTimeout(this.state.roundTimer)
        this.state.roundTimer = null
      }
      await this.endRound()
    }

    return {
      pointsEarned: points,
      correctIndex: question.correct_index,
      explanation: question.explanation,
    }
  }

  async endRound() {
    if (this.state.roundTimer) {
      clearTimeout(this.state.roundTimer)
      this.state.roundTimer = null
    }

    const round = this.state.currentRound
    const questionId = this.state.questionIds[round - 1]

    await this.broadcast({ type: 'round_end', round })

    const { data: question } = await supabaseAdmin
      .from('questions')
      .select('correct_index, explanation')
      .eq('id', questionId)
      .single()

    const scores = await this.getCurrentScores()

    await supabaseAdmin
      .from('rooms')
      .update({ round_ends_at: new Date().toISOString() })
      .eq('id', this.roomId)

    await this.broadcast({
      type: 'score_reveal',
      round,
      correctIndex: question?.correct_index ?? 0,
      explanation: question?.explanation ?? '',
      scores,
    })

    this.state.scoreRevealTimer = setTimeout(async () => {
      if (round >= this.state.totalRounds) {
        await this.endGame()
      } else {
        await this.startRound(round + 1)
      }
    }, 5000)
  }

  async endGame() {
    if (this.state.scoreRevealTimer) {
      clearTimeout(this.state.scoreRevealTimer)
      this.state.scoreRevealTimer = null
    }

    const finalScores = await this.getCurrentScores()

    await supabaseAdmin
      .from('rooms')
      .update({ status: 'finished', finished_at: new Date().toISOString() })
      .eq('id', this.roomId)

    await this.broadcast({ type: 'game_over', finalScores })

    activeRooms.delete(this.roomId)
  }

  private async getQuestion(round: number) {
    const questionId = this.state.questionIds[round - 1]
    const { data } = await supabaseAdmin
      .from('questions')
      .select('*')
      .eq('id', questionId)
      .single()
    return data
  }

  private async getCurrentScores(): Promise<PlayerScoreSnapshot[]> {
    const { data: players } = await supabaseAdmin
      .from('room_players')
      .select('user_id, score, users(nickname, avatar_url)')
      .eq('room_id', this.roomId)
      .order('score', { ascending: false })

    const { data: answers } = await supabaseAdmin
      .from('answers')
      .select('user_id, response_time_ms')
      .eq('room_id', this.roomId)
      .eq('is_correct', true)

    const totalTimeMap = new Map<string, number>()
    for (const a of answers || []) {
      totalTimeMap.set(a.user_id, (totalTimeMap.get(a.user_id) || 0) + (a.response_time_ms || 0))
    }

    return (players || []).map((p: any) => ({
      user_id: p.user_id,
      nickname: p.users?.nickname || 'Unknown',
      avatar_url: p.users?.avatar_url || '',
      score: p.score || 0,
      total_response_time_ms: totalTimeMap.get(p.user_id) || 0,
    }))
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  cleanup() {
    if (this.state.roundTimer) clearTimeout(this.state.roundTimer)
    if (this.state.scoreRevealTimer) clearTimeout(this.state.scoreRevealTimer)
    activeRooms.delete(this.roomId)
  }
}

interface ActiveRoomEntry {
  loop: GameLoop
  channel: ReturnType<typeof supabaseAdmin.channel>
}

const activeRooms = new Map<string, ActiveRoomEntry>()

export const gameMaster = {
  async createGame(roomId: string, questionIds: string[], playerCount: number) {
    const loop = new GameLoop(roomId, questionIds, playerCount)
    const channel = supabaseAdmin.channel(`room:${roomId}`)
    await channel.subscribe()
    activeRooms.set(roomId, { loop, channel })
    return loop
  },

  getGame(roomId: string): GameLoop | undefined {
    return activeRooms.get(roomId)?.loop
  },

  async removeGame(roomId: string) {
    const entry = activeRooms.get(roomId)
    if (entry) {
      entry.loop.cleanup()
      await entry.channel.unsubscribe()
    }
  },

  activeCount(): number {
    return activeRooms.size
  },
}
