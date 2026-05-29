export function isWeChatBrowser(): boolean {
  return /micromessenger/i.test(navigator.userAgent)
}

export function getWechatAuthUrl(): string {
  const appId = import.meta.env.VITE_WECHAT_APP_ID || ''
  const redirectUri = encodeURIComponent(`${window.location.origin}/auth/callback`)
  const state = generateState()
  sessionStorage.setItem('wechat_oauth_state', state)

  return (
    `https://open.weixin.qq.com/connect/oauth2/authorize?` +
    `appid=${appId}&redirect_uri=${redirectUri}&response_type=code` +
    `&scope=snsapi_userinfo&state=${state}#wechat_redirect`
  )
}

export function verifyState(state: string): boolean {
  const saved = sessionStorage.getItem('wechat_oauth_state')
  sessionStorage.removeItem('wechat_oauth_state')
  return saved === state
}

function generateState(): string {
  return Math.random().toString(36).substring(2, 15)
}

export function setupWeChatShare(roomCode: string) {
  if (!isWeChatBrowser()) return

  const shareData = {
    title: '来和我PK英语吧！',
    desc: `房间号: ${roomCode}，看看谁的英语更好！`,
    link: `${window.location.origin}/room/${roomCode}`,
    imgUrl: `${window.location.origin}/share-icon.png`,
  }

  // Dynamic share via WeChat JS-SDK
  fetch(`/api/wechat/jssdk-config?url=${encodeURIComponent(location.href)}`)
    .then((r) => r.json())
    .then((config) => {
      ;(window as any).wx?.config?.({
        debug: false,
        appId: config.appId,
        timestamp: config.timestamp,
        nonceStr: config.nonceStr,
        signature: config.signature,
        jsApiList: ['updateAppMessageShareData', 'updateTimelineShareData'],
      })
      ;(window as any).wx?.ready?.(() => {
        ;(window as any).wx?.updateAppMessageShareData?.(shareData)
        ;(window as any).wx?.updateTimelineShareData?.(shareData)
      })
    })
    .catch(() => {
      // JS-SDK may not be available, fall back to default share behavior
    })
}
