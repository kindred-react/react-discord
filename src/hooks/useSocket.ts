import { useEffect, useCallback, useRef, useState } from 'react'
import { wsService } from '../services/socketService'
import { useServerStore } from '../shared/stores/serverStore'
import { useUserStore } from '../shared/stores/userStore'
import type { Message } from '../shared/types'

interface BackendMessage {
  id: string
  channel_id: string
  author_id: string
  content: string
  type?: string
  voice_url?: string
  duration?: number
  attachments?: Array<{
    id: string
    filename: string
    url: string
    proxy_url?: string
    size: number
    content_type: string
    width?: number
    height?: number
  }>
  created_at: string
  author?: {
    id: string
    username: string
    avatar: string | null
    discriminator: string
  }
}

export function useSocket() {
  const { addMessage, addReceivedMessage, updateMessage, removeMessage, currentChannel, setMessages, currentServer, channels } = useServerStore()
  const user = useUserStore((state) => state.user)
  const isAuthenticated = useUserStore((state) => state.isAuthenticated)
  const userIdRef = useRef<string | null>(null)
  const joinedChannelsRef = useRef<Set<string>>(new Set())
  const currentServerRef = useRef<string | null>(null)
  const [isSocketConnected, setIsSocketConnected] = useState(false)
  const userRef = useRef(user)

  useEffect(() => {
    userRef.current = user
  }, [user])

  const connect = useCallback(() => {
    if (!user?.id) return
    
    if (userIdRef.current === user.id && wsService.isConnected()) {
      return
    }
    
    userIdRef.current = user.id
    
    wsService.connect('/ws', user.id)
  }, [user])

  const disconnect = useCallback(() => {
    wsService.disconnect()
    userIdRef.current = null
    joinedChannelsRef.current.clear()
  }, [wsService])

  const sendMessage = useCallback((content: string) => {
    if (!currentChannel || !user) return
    
    wsService.sendMessage(currentChannel.id, content)
  }, [currentChannel, user])

  useEffect(() => {
    const handleConnectionChange = (isConnected: boolean) => {
      setIsSocketConnected(isConnected)
    }

    wsService.onConnectionStatusChange(handleConnectionChange)

    return () => {
      wsService.offConnectionStatusChange(handleConnectionChange)
    }
  }, [])

  useEffect(() => {
    if (isAuthenticated && user?.id) {
      connect()
    } else if (!isAuthenticated) {
      disconnect()
    }
  }, [isAuthenticated, user?.id, connect, disconnect])

  useEffect(() => {
    const handleNewMessage = (data: unknown) => {
      console.log('[useSocket] Received message:new event, data:', data)
      const msgData = data as any
      
      // 后端直接发送消息对象
      const msg = msgData as BackendMessage
      
      if (msg && msg.content) {
        console.log('[useSocket] Processing message from user:', msg.author_id, 'current user:', user?.id)
        
        // 所有消息都应该被添加
        if (currentChannel && msg.channel_id === currentChannel.id) {
          const messageType = (msg.type || 'text') as Message['type']
          const message: Message = {
            id: msg.id,
            content: msg.content,
            type: messageType,
            voice_url: msg.voice_url,
            duration: msg.duration,
            attachments: msg.attachments || [],
            author: msg.author ? {
              id: msg.author.id,
              username: msg.author.username,
              avatar: msg.author.avatar || '',
              discriminator: msg.author.discriminator || '0001',
            } : { id: msg.author_id || 'unknown', username: 'Unknown', avatar: '', discriminator: '0000' },
            timestamp: msg.created_at || new Date().toISOString(),
          }
          
          console.log('[useSocket] Adding message to store')
          addReceivedMessage(message)
        }
      }
    }

    const handleHistoryMessage = (data: unknown) => {
      const historyData = data as { data: BackendMessage[]; channel_id: string; event: string }
      console.log('[useSocket] Received history messages:', historyData)
      
      if (historyData && historyData.data && historyData.channel_id === currentChannel?.id) {
        console.log('[useSocket] Received history messages for channel:', historyData.channel_id, 'count:', historyData.data.length)
        const messages: Message[] = historyData.data.map((msg: BackendMessage): Message => {
          const messageType = (msg.type || 'text') as Message['type']
          return {
            id: msg.id,
            content: msg.content,
            type: messageType,
            voice_url: msg.voice_url,
            duration: msg.duration,
            attachments: msg.attachments || [],
            author: msg.author ? {
              id: msg.author.id,
              username: msg.author.username,
              avatar: msg.author.avatar || '',
              discriminator: msg.author.discriminator || '0001',
            } : { id: msg.author_id || 'unknown', username: 'Unknown', avatar: '', discriminator: '0000' },
            timestamp: msg.created_at || new Date().toISOString(),
          }
        })
        setMessages(messages)
      }
    }

    const handleEditMessage = (data: unknown) => {
      const message = data as { id: string; content: string }
      updateMessage(message.id, message.content)
    }

    const handleDeleteMessage = (data: unknown) => {
      const messageId = data as string
      removeMessage(messageId)
    }

    wsService.on('message:new', handleNewMessage)
    wsService.on('message:history', handleHistoryMessage)
    wsService.on('message:edit', handleEditMessage)
    wsService.on('message:delete', handleDeleteMessage)

    return () => {
      wsService.off('message:new', handleNewMessage)
      wsService.off('message:history', handleHistoryMessage)
      wsService.off('message:edit', handleEditMessage)
      wsService.off('message:delete', handleDeleteMessage)
    }
  }, [addReceivedMessage, updateMessage, removeMessage, setMessages, user?.id, currentChannel])

  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentChannel && wsService.isConnected()) {
        const channelId = currentChannel.id
        if (!joinedChannelsRef.current.has(channelId)) {
          wsService.joinChannel(channelId)
          joinedChannelsRef.current.add(channelId)
        }
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [currentChannel])

  useEffect(() => {
    if (currentServer && wsService.isConnected()) {
      const newServerId = currentServer.id
      
      if (currentServerRef.current && currentServerRef.current !== newServerId) {
        console.log('[useSocket] Server changed, leaving all old channels')
        joinedChannelsRef.current.forEach((channelId) => {
          wsService.leaveChannel(channelId)
        })
        joinedChannelsRef.current.clear()
        
        setTimeout(() => {
          const textChannels = channels.filter(c => c.type === 'text')
          textChannels.forEach((channel) => {
            console.log('[useSocket] Joining channel for new server:', channel.name)
            wsService.joinChannel(channel.id)
            joinedChannelsRef.current.add(channel.id)
          })
        }, 100)
      }
      
      currentServerRef.current = newServerId
    }
  }, [currentServer, channels])

  return {
    connect,
    disconnect,
    sendMessage,
    isConnected: isSocketConnected,
  }
}
