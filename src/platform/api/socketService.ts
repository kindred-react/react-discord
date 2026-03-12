import { io, Socket } from 'socket.io-client'
import type { Message, User } from '../../shared/types'

export type Platform = 'web' | 'ios' | 'android'

let currentPlatform: Platform = 'web'

export const getPlatform = (): Platform => {
  if (typeof window === 'undefined') return 'web'
  const userAgent = navigator.userAgent.toLowerCase()
  if (/iphone|ipad|ipod/.test(userAgent)) return 'ios'
  if (/android/.test(userAgent)) return 'android'
  return 'web'
}

export const setPlatform = (platform: Platform): void => {
  currentPlatform = platform
}

export const isMobilePlatform = (): boolean => {
  return currentPlatform === 'ios' || currentPlatform === 'android'
}

export const isWebPlatform = (): boolean => {
  return currentPlatform === 'web'
}

if (typeof window !== 'undefined') {
  currentPlatform = getPlatform()
}

export interface SocketServiceConfig {
  url: string
  autoConnect?: boolean
}

class SocketService {
  private socket: Socket | null = null
  private messageHandlers: ((message: Message) => void)[] = []
  private connectionHandlers: ((connected: boolean) => void)[] = []

  connect(config?: SocketServiceConfig): void {
    if (this.socket?.connected) return

    const url = config?.url || (typeof window !== 'undefined' ? window.location.host : '')

    this.socket = io(url, {
      autoConnect: config?.autoConnect ?? true,
      transports: ['websocket', 'polling'],
    })

    this.socket.on('connect', () => {
      this.connectionHandlers.forEach(handler => handler(true))
    })

    this.socket.on('disconnect', () => {
      this.connectionHandlers.forEach(handler => handler(false))
    })

    this.socket.on('message', (message: Message) => {
      this.messageHandlers.forEach(handler => handler(message))
    })
  }

  disconnect(): void {
    this.socket?.disconnect()
    this.socket = null
  }

  sendMessage(content: string, channelId: string, author: User): void {
    this.socket?.emit('message', {
      content,
      channelId,
      author,
      timestamp: new Date().toISOString(),
    })
  }

  joinChannel(channelId: string, userId: string): void {
    this.socket?.emit('joinChannel', { channelId, userId })
  }

  leaveChannel(channelId: string, userId: string): void {
    this.socket?.emit('leaveChannel', { channelId, userId })
  }

  onMessage(handler: (message: Message) => void): () => void {
    this.messageHandlers.push(handler)
    return () => {
      this.messageHandlers = this.messageHandlers.filter(h => h !== handler)
    }
  }

  onConnectionChange(handler: (connected: boolean) => void): () => void {
    this.connectionHandlers.push(handler)
    return () => {
      this.connectionHandlers = this.connectionHandlers.filter(h => h !== handler)
    }
  }

  isConnected(): boolean {
    return this.socket?.connected ?? false
  }
}

export const socketService = new SocketService()
