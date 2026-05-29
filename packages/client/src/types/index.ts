export interface User {
  id: string
  wechat_openid: string
  nickname: string
  avatar_url: string
}

export interface Room {
  id: string
  invite_code: string
  host_user_id: string
  status: 'waiting' | 'countdown' | 'playing' | 'finished'
  difficulty: 'easy' | 'medium' | 'hard'
  question_ids: string[]
  current_round: number
  round_started_at: string | null
  round_ends_at: string | null
  created_at: string
  finished_at: string | null
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

export interface PlayerScoreSnapshot {
  user_id: string
  nickname: string
  avatar_url: string
  score: number
  total_response_time_ms: number
}

export interface PlayerInfo {
  user_id: string
  nickname: string
  avatar_url: string
  score: number
}

export type GameBroadcastEvent =
  | { type: 'countdown_tick'; value: number }
  | { type: 'round_start'; round: number; question: QuestionData; serverTime: number }
  | { type: 'round_end'; round: number }
  | { type: 'score_reveal'; round: number; correctIndex: number; explanation: string; scores: PlayerScoreSnapshot[] }
  | { type: 'game_over'; finalScores: PlayerScoreSnapshot[] }
  | { type: 'player_answered_count'; round: number; answered: number; total: number }
  | { type: 'player_joined'; player: PlayerInfo }
