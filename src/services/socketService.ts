type WSMessage = {
  type?: string
  event: string
  channel_id?: string
  guild_id?: string
  data?: unknown
}

type MessageHandler = (data: unknown) => void

class WebSocketService {
  private ws: WebSocket | null = null
  private url: string = ''
  private userId: string = ''
  private reconnectInterval: number = 2000
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null
  private handlers: Map<string, Set<MessageHandler>> = new Map()
  private isManualClose: boolean = false
  private connectionAttempts: number = 0
  private maxAttempts: number = 10
  private isConnecting: boolean = false
  private pendingMessages: Array<{ event: string; data?: unknown }> = []
  private pingTimer: ReturnType<typeof setInterval> | null = null
  private pingInterval: number = 30000

  connect(url: string = '/ws', userId: string) {
    this.isManualClose = false
    
    this.url = url
    this.userId = userId

    if (this.ws?.readyState === WebSocket.OPEN) {
      console.log('[WebSocket] Already connected')
      return
    }

    if (this.isConnecting) {
      console.log('[WebSocket] Already connecting, waiting...')
      return
    }

    if (this.ws?.readyState === WebSocket.CONNECTING) {
      console.log('[WebSocket] Already connecting, waiting...')
      return
    }

    this.isConnecting = true
    
    const wsUrl = `${this.url}${this.url.includes('?') ? '&' : '?'}user_id=${userId}`
    console.log('[WebSocket] Creating connection to:', wsUrl)
    console.log('[WebSocket] Full URL:', window.location.origin + wsUrl)
    console.log('[WebSocket] URL includes:', { url: this.url, hasQuestion: this.url.includes('?') })

    try {
      this.ws = new WebSocket(wsUrl)

      this.ws.onopen = () => {
        console.log('[WebSocket] Connection opened!')
        this.isConnecting = false
        this.connectionAttempts = 0
        this.flushPendingMessages()
        
        this.startPing()
      }

      this.ws.onclose = (event) => {
        console.log('[WebSocket] Connection closed, code:', event.code, 'reason:', event.reason)
        this.isConnecting = false
        this.ws = null
        this.stopPing()
        
        if (event.code === 1006) {
          console.warn('[WebSocket] Abnormal closure, possible network issue')
        }
        
        if (!this.isManualClose && event.code !== 1000) {
          console.log('[WebSocket] Will reconnect...')
          this.reconnect()
        }
      }

      this.ws.onerror = (error) => {
        console.error('[WebSocket] Error occurred:', error)
      }

      this.ws.onmessage = (event) => {
        if (event.data === 'pong') {
          console.log('[WebSocket] Received pong')
          return
        }
        console.log('[WebSocket] Received:', event.data)
        try {
          const message: WSMessage = JSON.parse(event.data)
          this.handleMessage(message)
        } catch (err) {
          console.error('[WebSocket] Failed to parse message:', err)
        }
      }
    } catch (err) {
      console.error('[WebSocket] Connection error:', err)
      this.isConnecting = false
      this.reconnect()
    }
  }

  private flushPendingMessages() {
    console.log('[WebSocket] Flushing pending messages:', this.pendingMessages.length)
    const messages = [...this.pendingMessages]
    this.pendingMessages = []
    messages.forEach(({ event, data }) => {
      this.send(event, data, true)
    })
  }

  private handleMessage(message: WSMessage) {
    console.log('[WebSocket] Handling event:', message.event)
    const handlers = this.handlers.get(message.event)
    if (handlers) {
      handlers.forEach((handler) => {
        handler(message.data)
      })
    }

    const allHandlers = this.handlers.get('*')
    if (allHandlers) {
      allHandlers.forEach((handler) => {
        handler(message)
      })
    }
  }

  disconnect() {
    this.isManualClose = true
    this.stopPing()
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }
    if (this.ws) {
      this.ws.close(1000, 'Client disconnect')
      this.ws = null
    }
  }

  private startPing() {
    this.stopPing()
    this.pingTimer = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.ws.send('ping')
        console.log('[WebSocket] Sent ping')
      }
    }, this.pingInterval)
  }

  private stopPing() {
    if (this.pingTimer) {
      clearInterval(this.pingTimer)
      this.pingTimer = null
    }
  }

  private reconnect() {
    if (this.isManualClose) return
    if (this.connectionAttempts >= this.maxAttempts) {
      console.log('[WebSocket] Max attempts reached')
      return
    }

    if (this.reconnectTimer) return

    this.connectionAttempts++
    console.log(`[WebSocket] Reconnecting, attempt ${this.connectionAttempts}`)

    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null
      this.connect(this.url, this.userId)
    }, this.reconnectInterval)
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN
  }

  send(event: string, data?: unknown, force: boolean = false) {
    if (this.ws?.readyState !== WebSocket.OPEN) {
      if (force) {
        console.log('[WebSocket] Queuing message (not connected):', event)
        this.pendingMessages.push({ event, data })
      } else {
        console.warn('[WebSocket] Not connected, cannot send:', event)
      }
      return
    }

    const message: WSMessage = {
      event,
      data,
    }

    console.log('[WebSocket] Sending:', JSON.stringify(message))
    this.ws.send(JSON.stringify(message))
  }

  sendMessage(channelId: string, content: string) {
    console.log('[WebSocket] sendMessage called:', channelId, content)
    this.send('message:send', {
      channel_id: channelId,
      content,
    }, true)
  }

  joinChannel(channelId: string) {
    console.log('[WebSocket] joinChannel called:', channelId)
    this.send('join_channel', { channel_id: channelId }, true)
  }

  leaveChannel(channelId: string) {
    this.send('leave_channel', { channel_id: channelId })
  }

  joinVoiceChannel(channelId: string, guildId: string) {
    this.send('channel:voice:join', {
      channel_id: channelId,
      guild_id: guildId,
    })
  }

  leaveVoiceChannel(guildId: string) {
    this.send('channel:voice:leave', {
      guild_id: guildId,
    })
  }

  on(event: string, handler: MessageHandler) {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, new Set())
    }
    this.handlers.get(event)?.add(handler)
  }

  off(event: string, handler: MessageHandler) {
    this.handlers.get(event)?.delete(handler)
  }

  removeAllListeners() {
    this.handlers.clear()
  }
}

export const wsService = new WebSocketService()
