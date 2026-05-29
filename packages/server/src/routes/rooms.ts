import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import jwt from 'jsonwebtoken'
import { supabaseAdmin } from '../supabase/client.js'
import { gameMaster } from '../services/gameMaster.js'
import { config } from '../config.js'

const createRoomSchema = z.object({
  difficulty: z.enum(['easy', 'medium', 'hard']),
})

function generateInviteCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)]
  }
  return code
}

async function getUserIdFromToken(authHeader: string): Promise<{ userId: string; openid: string } | null> {
  if (!authHeader?.startsWith('Bearer ')) return null
  const token = authHeader.slice(7)

  try {
    const decoded = jwt.verify(token, config.supabase.jwtSecret) as any
    const openid = decoded.openid || ''

    const { data: dbUser } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('wechat_openid', openid)
      .single()

    if (!dbUser) return null
    return { userId: dbUser.id, openid }
  } catch {
    return null
  }
}

export async function roomRoutes(app: FastifyInstance) {
  app.post('/api/rooms', async (request, reply) => {
    const parsed = createRoomSchema.safeParse(request.body)
    if (!parsed.success) {
      return reply.status(400).send({ error: 'Invalid request body' })
    }

    const auth = await getUserIdFromToken(request.headers.authorization || '')
    if (!auth) return reply.status(401).send({ error: 'Unauthorized' })

    const { difficulty } = parsed.data

    const { data: questions } = await supabaseAdmin
      .from('questions')
      .select('id')
      .eq('difficulty', difficulty)
      .limit(6)

    if (!questions || questions.length < 6) {
      return reply.status(500).send({ error: 'Not enough questions for this difficulty' })
    }

    const questionIds = questions.map((q) => q.id)

    let inviteCode = generateInviteCode()
    let attempts = 0
    while (attempts < 10) {
      const { data: existing } = await supabaseAdmin
        .from('rooms')
        .select('id')
        .eq('invite_code', inviteCode)
        .single()
      if (!existing) break
      inviteCode = generateInviteCode()
      attempts++
    }

    const { data: room, error } = await supabaseAdmin
      .from('rooms')
      .insert({
        invite_code: inviteCode,
        host_user_id: auth.userId,
        difficulty,
        question_ids: questionIds,
      })
      .select('*')
      .single()

    if (error || !room) {
      return reply.status(500).send({ error: 'Failed to create room' })
    }

    await supabaseAdmin.from('room_players').insert({
      room_id: room.id,
      user_id: auth.userId,
    })

    const { data: players } = await supabaseAdmin
      .from('room_players')
      .select('user_id, score, users(nickname, avatar_url)')
      .eq('room_id', room.id)

    return {
      room,
      players: (players || []).map((p: any) => ({
        user_id: p.user_id,
        nickname: p.users?.nickname || 'Unknown',
        avatar_url: p.users?.avatar_url || '',
        score: p.score,
      })),
      isHost: true,
    }
  })

  app.get('/api/rooms/:inviteCode', async (request, reply) => {
    const auth = await getUserIdFromToken(request.headers.authorization || '')
    if (!auth) return reply.status(401).send({ error: 'Unauthorized' })

    const { inviteCode } = request.params as { inviteCode: string }

    const { data: room } = await supabaseAdmin
      .from('rooms')
      .select('*')
      .eq('invite_code', inviteCode.toUpperCase())
      .single()

    if (!room) return reply.status(404).send({ error: 'Room not found' })

    const { data: players } = await supabaseAdmin
      .from('room_players')
      .select('user_id, score, users(nickname, avatar_url)')
      .eq('room_id', room.id)
      .order('score', { ascending: false })

    return {
      room,
      players: (players || []).map((p: any) => ({
        user_id: p.user_id,
        nickname: p.users?.nickname || 'Unknown',
        avatar_url: p.users?.avatar_url || '',
        score: p.score,
      })),
      isHost: room.host_user_id === auth.userId,
      currentRound: room.current_round,
    }
  })

  app.post('/api/rooms/:inviteCode/join', async (request, reply) => {
    const auth = await getUserIdFromToken(request.headers.authorization || '')
    if (!auth) return reply.status(401).send({ error: 'Unauthorized' })

    const { inviteCode } = request.params as { inviteCode: string }

    const { data: room } = await supabaseAdmin
      .from('rooms')
      .select('*')
      .eq('invite_code', inviteCode.toUpperCase())
      .single()

    if (!room) return reply.status(404).send({ error: 'Room not found' })
    if (room.status !== 'waiting') {
      return reply.status(400).send({ error: 'Game already in progress' })
    }

    const { data: existing } = await supabaseAdmin
      .from('room_players')
      .select('id')
      .eq('room_id', room.id)
      .eq('user_id', auth.userId)
      .single()

    if (!existing) {
      await supabaseAdmin.from('room_players').insert({
        room_id: room.id,
        user_id: auth.userId,
      })
    }

    const { data: players } = await supabaseAdmin
      .from('room_players')
      .select('user_id, score, users(nickname, avatar_url)')
      .eq('room_id', room.id)

    const playerList = (players || []).map((p: any) => ({
      user_id: p.user_id,
      nickname: p.users?.nickname || 'Unknown',
      avatar_url: p.users?.avatar_url || '',
      score: p.score,
    }))

    return { room, players: playerList }
  })

  app.post('/api/rooms/:inviteCode/start', async (request, reply) => {
    const auth = await getUserIdFromToken(request.headers.authorization || '')
    if (!auth) return reply.status(401).send({ error: 'Unauthorized' })

    const { inviteCode } = request.params as { inviteCode: string }

    const { data: room } = await supabaseAdmin
      .from('rooms')
      .select('*')
      .eq('invite_code', inviteCode.toUpperCase())
      .single()

    if (!room) return reply.status(404).send({ error: 'Room not found' })
    if (room.host_user_id !== auth.userId) {
      return reply.status(403).send({ error: 'Only the host can start the game' })
    }
    if (room.status !== 'waiting') {
      return reply.status(400).send({ error: 'Game already started' })
    }

    const { count: playerCount } = await supabaseAdmin
      .from('room_players')
      .select('*', { count: 'exact', head: true })
      .eq('room_id', room.id)

    if (!playerCount || playerCount < 2) {
      return reply.status(400).send({ error: 'Need at least 2 players' })
    }

    const loop = await gameMaster.createGame(room.id, room.question_ids, playerCount)
    loop.begin()

    return { success: true, room }
  })

  app.post('/api/rooms/:inviteCode/answer', async (request, reply) => {
    const auth = await getUserIdFromToken(request.headers.authorization || '')
    if (!auth) return reply.status(401).send({ error: 'Unauthorized' })

    const { inviteCode } = request.params as { inviteCode: string }

    const bodySchema = z.object({
      selectedIndex: z.number().int().min(0).max(3),
      responseTimeMs: z.number().min(0),
    })

    const parsed = bodySchema.safeParse(request.body)
    if (!parsed.success) {
      return reply.status(400).send({ error: 'Invalid request body' })
    }

    const { data: room } = await supabaseAdmin
      .from('rooms')
      .select('*')
      .eq('invite_code', inviteCode.toUpperCase())
      .single()

    if (!room) return reply.status(404).send({ error: 'Room not found' })
    if (room.status !== 'playing') {
      return reply.status(400).send({ error: 'Game is not active' })
    }

    const { selectedIndex, responseTimeMs } = parsed.data

    const loop = gameMaster.getGame(room.id)
    if (!loop) {
      return reply.status(400).send({ error: 'Game not found on server' })
    }

    const result = await loop.processAnswer(auth.userId, selectedIndex, responseTimeMs)
    if (!result) {
      return reply.status(400).send({ error: 'Already answered or invalid submission' })
    }

    return result
  })
}
