export interface TauriAppInfo {
  name: string
  version: string
}

export interface SystemInfo {
  os: string
  arch: string
}

interface TauriWindow {
  minimize: () => Promise<void>
  maximize: () => Promise<void>
  close: () => Promise<void>
  isMaximized: () => Promise<boolean>
}

interface TauriCore {
  invoke: <T = unknown>(cmd: string, args?: Record<string, unknown>) => Promise<T>
}

declare global {
  interface Window {
    __TAURI__?: {
      core: TauriCore
      window: TauriWindow
    }
  }
}

class TauriService {
  private initialized = false

  private isTauriAvailable(): boolean {
    return typeof window !== 'undefined' && !!window.__TAURI__
  }

  async init(): Promise<void> {
    if (this.initialized || !this.isTauriAvailable()) return
    
    try {
      const result = await window.__TAURI__?.core.invoke<string>('init_app')
      this.initialized = true
      console.log('[Tauri] Service initialized:', result)
    } catch {
      console.log('[Tauri] Running in browser mode')
    }
  }

  async getAppInfo(): Promise<TauriAppInfo | null> {
    if (!this.isTauriAvailable()) return null
    
    try {
      const info = await window.__TAURI__?.core.invoke<TauriAppInfo>('get_app_info')
      return info ?? null
    } catch {
      return null
    }
  }

  async getSystemInfo(): Promise<SystemInfo | null> {
    if (!this.isTauriAvailable()) return null
    
    try {
      const info = await window.__TAURI__?.core.invoke<SystemInfo>('get_system_info')
      return info ?? null
    } catch {
      return null
    }
  }

  async openExternal(url: string): Promise<boolean> {
    window.open(url, '_blank')
    return true
  }

  async minimizeWindow(): Promise<void> {
    if (!this.isTauriAvailable()) return
    
    try {
      await window.__TAURI__?.core.invoke('minimize_window')
    } catch (error) {
      console.error('[Tauri] Failed to minimize window:', error)
    }
  }

  async maximizeWindow(): Promise<void> {
    if (!this.isTauriAvailable()) return
    
    try {
      await window.__TAURI__?.core.invoke('maximize_window')
    } catch (error) {
      console.error('[Tauri] Failed to maximize window:', error)
    }
  }

  async closeWindow(): Promise<void> {
    if (!this.isTauriAvailable()) return
    
    try {
      await window.__TAURI__?.core.invoke('close_window')
    } catch (error) {
      console.error('[Tauri] Failed to close window:', error)
    }
  }

  isDesktop(): boolean {
    return this.isTauriAvailable()
  }
}

export const tauriService = new TauriService()
