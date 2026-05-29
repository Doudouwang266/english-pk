import { ref, onUnmounted } from 'vue'

export function useCountdown() {
  const remaining = ref(0)
  const progress = ref(1)
  let animFrameId = 0
  let endTime = 0
  let totalMs = 0

  function start(durationMs: number, serverEndTime?: number) {
    totalMs = durationMs
    endTime = serverEndTime || Date.now() + durationMs
    remaining.value = durationMs
    progress.value = 1
    tick()
  }

  function tick() {
    const now = Date.now()
    const left = Math.max(0, endTime - now)
    remaining.value = left
    progress.value = totalMs > 0 ? left / totalMs : 0

    if (left > 0) {
      animFrameId = requestAnimationFrame(tick)
    }
  }

  function stop() {
    if (animFrameId) {
      cancelAnimationFrame(animFrameId)
      animFrameId = 0
    }
  }

  onUnmounted(() => stop())

  return { remaining, progress, start, stop }
}
