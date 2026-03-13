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
  created_at: string
  author?: {
    id: string
    username: string
    avatar: string | null
    discriminator: string
  }
}

export function useSocket() {
  const { addMessage, addReceivedMessage, updateMessage, removeMessage, currentChannel } = useServerStore()
  const user = useUserStore((state) => state.user)
  const isAuthenticated = useUserStore((state) => state.isAuthenticated)
  const userIdRef = useRef<string | null>(null)
  const joinedChannelsRef = useRef<Set<string>>(new Set())
  const [isSocketConnected, setIsSocketConnected] = useState(false)
  const userRef = useRef(user)
  userRef.current = user

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
  }, [])

  const sendMessage = useCallback((content: string) => {
    if (!currentChannel || !user) return
    
    wsService.sendMessage(currentChannel.id, content)
    
    const author: Message['author'] = {
      id: user.id,
      username: user.username,
      avatar: user.avatar,
      discriminator: user.discriminator,
    }
    addMessage(content, author)
  }, [currentChannel, user, addMessage])

  useEffect(() => {
    const handleConnectionChange = (isConnected: boolean) => {
      setIsSocketConnected(isConnected)
      if (isConnected && userRef.current?.id) {
        if (userIdRef.current !== userRef.current.id) {
          userIdRef.current = userRef.current.id
          wsService.connect('/ws', userRef.current.id)
        }
      }
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
      const msg = data as BackendMessage
      if (msg && msg.content) {
        if (msg.author?.id !== user?.id && currentChannel) {
          const message: Message = {
            id: msg.id,
            content: msg.content,
            author: msg.author ? {
              id: msg.author.id,
              username: msg.author.username,
              avatar: msg.author.avatar || '',
              discriminator: msg.author.discriminator || '0001',
            } : { id: msg.author_id || 'unknown', username: 'Unknown', avatar: '', discriminator: '0000' },
            timestamp: msg.created_at || new Date().toISOString(),
          }
          addReceivedMessage(message)
        }
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
    wsService.on('message:edit', handleEditMessage)
    wsService.on('message:delete', handleDeleteMessage)

    return () => {
      wsService.removeAllListeners()
    }
  }, [addReceivedMessage, updateMessage, removeMessage, user?.id, currentChannel])

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

  return {
    connect,
    disconnect,
    sendMessage,
    isConnected: isSocketConnected,
  }
}
