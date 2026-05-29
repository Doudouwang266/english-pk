export type RoomStatus = 'waiting' | 'countdown' | 'playing' | 'finished'
export type DifficultyLevel = 'easy' | 'medium' | 'hard'
export type QuestionType =
  | 'vocabulary'
  | 'grammar'
  | 'translation'
  | 'synonym'
  | 'reading'
  | 'listening'

export interface User {
  id: string
  wechat_openid: string
  nickname: string
  avatar_url: string
  created_at: string
}

export interface Room {
  id: string
  invite_code: string
  host_user_id: string
  status: RoomStatus
  difficulty: DifficultyLevel
  question_ids: string[]
  current_round: number
  round_started_at: string | null
  round_ends_at: string | null
  created_at: string
  finished_at: string | null
}

export interface RoomPlayer {
  id: string
  room_id: string
  user_id: string
  nickname: string
  avatar_url: string
  score: number
  joined_at: string
}

export interface Question {
  id: string
  type: QuestionType
  difficulty: DifficultyLevel
  stem: string
  media_url: string | null
  options: string[]
  correct_index: number
  explanation: string
  time_limit_ms: number
}

export interface Answer {
  id: string
  room_id: string
  user_id: string
  question_id: string
  round_number: number
  selected_index: number | null
  is_correct: boolean
  response_time_ms: number
  points_earned: number
  answered_at: string
}

export interface PlayerScoreSnapshot {
  user_id: string
  nickname: string
  avatar_url: string
  score: number
  total_response_time_ms: number
}

export type GameBroadcastEvent =
  | { type: 'countdown_tick'; value: number }
  | { type: 'round_start'; round: number; question: QuestionPublic; serverTime: number }
  | { type: 'round_end'; round: number }
  | { type: 'score_reveal'; round: number; correctIndex: number; explanation: string; scores: PlayerScoreSnapshot[] }
  | { type: 'game_over'; finalScores: PlayerScoreSnapshot[] }
  | { type: 'player_answered_count'; round: number; answered: number; total: number }
  | { type: 'player_joined'; player: RoomPlayer }
  | { type: 'host_start'; countdown: number }

export interface QuestionPublic {
  id: string
  type: QuestionType
  stem: string
  mediaUrl: string | null
  options: string[]
  timeLimitMs: number
  roundNumber: number
  totalRounds: number
}
