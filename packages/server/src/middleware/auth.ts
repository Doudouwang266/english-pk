import type { FastifyRequest, FastifyReply } from 'fastify'
import { supabaseAdmin } from '../supabase/client.js'

export async function authMiddleware(request: FastifyRequest, reply: FastifyReply) {
  const authHeader = request.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return reply.status(401).send({ error: 'Missing or invalid authorization header' })
  }

  const token = authHeader.slice(7)

  const { data, error } = await supabaseAdmin.auth.getUser(token)
  if (error || !data.user) {
    return reply.status(401).send({ error: 'Invalid or expired token' })
  }

  request.userId = data.user.id
  request.userOpenid = data.user.user_metadata?.openid || ''
}
