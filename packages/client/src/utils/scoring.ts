const TIME_BUCKETS: { maxMs: number; points: number; label: string }[] = [
  { maxMs: 1500, points: 100, label: 'Perfect!' },
  { maxMs: 3000, points: 85, label: 'Great!' },
  { maxMs: 5000, points: 70, label: 'Good!' },
  { maxMs: 8000, points: 55, label: 'OK' },
  { maxMs: 12000, points: 40, label: 'Slow' },
  { maxMs: 15000, points: 25, label: 'Last second' },
]

export function estimatePoints(responseTimeMs: number): { points: number; label: string } {
  for (const bucket of TIME_BUCKETS) {
    if (responseTimeMs <= bucket.maxMs) {
      return { points: bucket.points, label: bucket.label }
    }
  }
  return { points: 0, label: 'Too slow' }
}

export function formatTime(ms: number): string {
  const seconds = Math.floor(ms / 1000)
  const tenths = Math.floor((ms % 1000) / 100)
  return `${seconds}.${tenths}s`
}
