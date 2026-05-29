import { config } from '../config.js'

interface WechatTokenResponse {
  access_token: string
  openid: string
  unionid?: string
  refresh_token: string
}

interface WechatUserInfo {
  openid: string
  nickname: string
  headimgurl: string
  unionid?: string
}

export async function getWechatAccessToken(code: string): Promise<WechatTokenResponse> {
  const url = new URL('https://api.weixin.qq.com/sns/oauth2/access_token')
  url.searchParams.set('appid', config.wechat.appId)
  url.searchParams.set('secret', config.wechat.appSecret)
  url.searchParams.set('code', code)
  url.searchParams.set('grant_type', 'authorization_code')

  const res = await fetch(url.toString())
  if (!res.ok) throw new Error(`WeChat token exchange failed: ${res.status}`)

  const data = (await res.json()) as any
  if (data.errcode) throw new Error(`WeChat error: ${data.errmsg} (code: ${data.errcode})`)

  return {
    access_token: data.access_token,
    openid: data.openid,
    unionid: data.unionid,
    refresh_token: data.refresh_token,
  }
}

export async function getWechatUserInfo(
  accessToken: string,
  openid: string
): Promise<WechatUserInfo> {
  const url = new URL('https://api.weixin.qq.com/sns/userinfo')
  url.searchParams.set('access_token', accessToken)
  url.searchParams.set('openid', openid)
  url.searchParams.set('lang', 'zh_CN')

  const res = await fetch(url.toString())
  if (!res.ok) throw new Error(`WeChat userinfo fetch failed: ${res.status}`)

  const data = (await res.json()) as any
  if (data.errcode) throw new Error(`WeChat error: ${data.errmsg}`)

  return {
    openid: data.openid,
    nickname: data.nickname,
    headimgurl: data.headimgurl,
    unionid: data.unionid,
  }
}
