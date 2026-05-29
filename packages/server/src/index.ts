import Fastify from 'fastify'
import cors from '@fastify/cors'
import fastifyStatic from '@fastify/static'
import { config } from './config.js'
import { authRoutes } from './routes/auth.js'
import { roomRoutes } from './routes/rooms.js'
import { questionRoutes } from './routes/questions.js'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { existsSync } from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const app = Fastify({ logger: true })

await app.register(cors, {
  origin: true,
  credentials: true,
})

declare module 'fastify' {
  interface FastifyRequest {
    userId?: string
    userOpenid?: string
  }
}

await app.register(authRoutes)
await app.register(roomRoutes)
await app.register(questionRoutes)

app.get('/api/health', async () => {
  return { ok: true, timestamp: new Date().toISOString() }
})

// Serve static client files in production
const clientDistPath = join(__dirname, '../../client/dist')
if (existsSync(clientDistPath)) {
  await app.register(fastifyStatic, {
    root: clientDistPath,
    prefix: '/',
  })

  // SPA fallback - return index.html for all non-API routes
  app.setNotFoundHandler(async (request, reply) => {
    if (request.url.startsWith('/api/')) {
      return reply.status(404).send({ error: 'Not found' })
    }
    return reply.sendFile('index.html')
  })
}

try {
  await app.listen({ port: config.server.port, host: config.server.host })
  console.log(`Server running at http://${config.server.host}:${config.server.port}`)
} catch (err) {
  app.log.error(err)
  process.exit(1)
}
