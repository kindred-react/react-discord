export type Platform = 'web' | 'ios' | 'android' | 'desktop'

export const getPlatform = (): Platform => {
  if (typeof window === 'undefined') return 'web'
  
  const userAgent = navigator.userAgent.toLowerCase()
  if (/iphone|ipad|ipod/.test(userAgent)) return 'ios'
  if (/android/.test(userAgent)) return 'android'
  
  if (typeof window !== 'undefined' && '__TAURI__' in window) {
    return 'desktop'
  }
  
  return 'web'
}

export const isMobile = (): boolean => {
  if (typeof window === 'undefined') return false
  const platform = getPlatform()
  return platform === 'ios' || platform === 'android'
}

export const isWeb = (): boolean => {
  return getPlatform() === 'web'
}

export const isIOS = (): boolean => {
  return getPlatform() === 'ios'
}

export const isAndroid = (): boolean => {
  return getPlatform() === 'android'
}

export const isDesktop = (): boolean => {
  if (typeof window === 'undefined') return false
  return getPlatform() === 'desktop'
}
