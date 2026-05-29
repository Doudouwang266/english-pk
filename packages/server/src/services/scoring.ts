const TIME_BUCKETS: { maxMs: number; points: number }[] = [
  { maxMs: 1500, points: 100 },
  { maxMs: 3000, points: 85 },
  { maxMs: 5000, points: 70 },
  { maxMs: 8000, points: 55 },
  { maxMs: 12000, points: 40 },
  { maxMs: 15000, points: 25 },
]

export function calculatePoints(
  responseTimeMs: number,
  isCorrect: boolean,
  timeLimitMs: number = 15000
): number {
  if (!isCorrect) return 0
  if (responseTimeMs > timeLimitMs) return 0

  for (const bucket of TIME_BUCKETS) {
    if (responseTimeMs <= bucket.maxMs) {
      return bucket.points
    }
  }
  return 0
}

export function verifyResponseTime(
  clientResponseTimeMs: number,
  roundStartedAt: string | null
): number {
  if (!roundStartedAt) return clientResponseTimeMs

  const serverElapsed = Date.now() - new Date(roundStartedAt).getTime()

  if (Math.abs(clientResponseTimeMs - serverElapsed) > 500) {
    return Math.min(serverElapsed, 15000)
  }

  return clientResponseTimeMs
}
