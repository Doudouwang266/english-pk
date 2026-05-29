import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import jwt from 'jsonwebtoken'
import { supabaseAdmin } from '../supabase/client.js'
import { getWechatAccessToken, getWechatUserInfo } from '../services/wechatAuth.js'
import { config } from '../config.js'

const codeSchema = z.object({
  code: z.string().min(1),
})

const guestSchema = z.object({
  nickname: z.string().min(1).max(20),
})

const GUEST_AVATARS = [
  'https://api.dicebear.com/7.x/bottts/svg?seed=guest1',
  'https://api.dicebear.com/7.x/bottts/svg?seed=guest2',
  'https://api.dicebear.com/7.x/bottts/svg?seed=guest3',
  'https://api.dicebear.com/7.x/bottts/svg?seed=guest4',
  'https://api.dicebear.com/7.x/bottts/svg?seed=guest5',
  'https://api.dicebear.com/7.x/bottts/svg?seed=guest6',
]

function signJwt(userId: string, openid: string): string {
  const now = Math.floor(Date.now() / 1000)
  return jwt.sign(
    {
      sub: userId,
      openid,
      aud: 'authenticated',
      role: 'authenticated',
    },
    config.supabase.jwtSecret,
    {
      expiresIn: '24h',
    }
  )
}

export async function authRoutes(app: FastifyInstance) {
  app.post('/api/auth/wechat/code', async (request, reply) => {
    const parsed = codeSchema.safeParse(request.body)
    if (!parsed.success) {
      return reply.status(400).send({ error: 'Invalid request body', details: parsed.error })
    }

    const { code } = parsed.data

    try {
      const tokenData = await getWechatAccessToken(code)
      const userInfo = await getWechatUserInfo(tokenData.access_token, tokenData.openid)

      const { data: existingUser } = await supabaseAdmin
        .from('users')
        .select('*')
        .eq('wechat_openid', userInfo.openid)
        .single()

      let userId: string

      if (existingUser) {
        userId = existingUser.id
        await supabaseAdmin
          .from('users')
          .update({
            nickname: userInfo.nickname,
            avatar_url: userInfo.headimgurl,
          })
          .eq('id', userId)
      } else {
        const { data: newUser, error: createError } = await supabaseAdmin
          .from('users')
          .insert({
            wechat_openid: userInfo.openid,
            nickname: userInfo.nickname,
            avatar_url: userInfo.headimgurl,
          })
          .select('id')
          .single()

        if (createError || !newUser) {
          return reply.status(500).send({ error: 'Failed to create user' })
        }
        userId = newUser.id
      }

      const accessToken = signJwt(userId, userInfo.openid)

      return {
        access_token: accessToken,
        user: {
          id: userId,
          wechat_openid: userInfo.openid,
          nickname: userInfo.nickname,
          avatar_url: userInfo.headimgurl,
        },
      }
    } catch (err: any) {
      request.log.error(err)
      return reply.status(500).send({ error: err.message || 'Authentication failed' })
    }
  })

  app.post('/api/auth/guest', async (request, reply) => {
    const parsed = guestSchema.safeParse(request.body)
    if (!parsed.success) {
      return reply.status(400).send({ error: 'Invalid nickname' })
    }

    const { nickname } = parsed.data
    const guestOpenid = `guest_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
    const avatar = GUEST_AVATARS[Math.floor(Math.random() * GUEST_AVATARS.length)]

    const { data: newUser, error } = await supabaseAdmin
      .from('users')
      .insert({
        wechat_openid: guestOpenid,
        nickname,
        avatar_url: avatar,
      })
      .select('id')
      .single()

    if (error || !newUser) {
      return reply.status(500).send({ error: 'Failed to create guest user' })
    }

    const accessToken = signJwt(newUser.id, guestOpenid)

    return {
      access_token: accessToken,
      user: {
        id: newUser.id,
        wechat_openid: guestOpenid,
        nickname,
        avatar_url: avatar,
      },
    }
  })

  app.get('/api/auth/me', async (request, reply) => {
    const authHeader = request.headers.authorization
    if (!authHeader?.startsWith('Bearer ')) {
      return reply.status(401).send({ error: 'Unauthorized' })
    }

    const token = authHeader.slice(7)

    try {
      const decoded = jwt.verify(token, config.supabase.jwtSecret) as any
      const openid = decoded.openid || ''

      const { data: dbUser } = await supabaseAdmin
        .from('users')
        .select('*')
        .eq('wechat_openid', openid)
        .single()

      if (!dbUser) {
        return reply.status(401).send({ error: 'User not found' })
      }

      return { user: dbUser }
    } catch {
      return reply.status(401).send({ error: 'Invalid token' })
    }
  })
}
