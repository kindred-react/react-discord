import { useEffect, useCallback, useRef } from 'react'
import { wsService } from '../services/socketService'
import { useServerStore } from '../stores/serverStore'
import { useUserStore } from '../stores/userStore'
import type { Message, User } from '../mock/data'

export function useSocket() {
  const { addMessage, updateMessage, removeMessage, currentChannel } = useServerStore()
  const user = useUserStore((state) => state.user)
  const userIdRef = useRef<string | null>(null)
  const joinedChannelsRef = useRef<Set<string>>(new Set())

  const connect = useCallback(() => {
    if (!user?.id) return
    
    if (userIdRef.current === user.id && wsService.isConnected()) {
      return
    }
    
    userIdRef.current = user.id
    
    wsService.connect('/ws', user.id)
  }, [user?.id])

  const disconnect = useCallback(() => {
    wsService.disconnect()
    userIdRef.current = null
    joinedChannelsRef.current.clear()
  }, [])

  const sendMessage = useCallback((content: string) => {
    if (!currentChannel || !user) return
    
    wsService.sendMessage(currentChannel.id, content)
    
    const author: User = {
      id: user.id,
      username: user.username,
      avatar: user.avatar,
      discriminator: user.discriminator,
      status: 'online',
      role: 'member'
    }
    addMessage(content, author)
  }, [currentChannel, user, addMessage])

  useEffect(() => {
    const handleNewMessage = (data: unknown) => {
      const msg = data as Message
      if (msg && msg.content) {
        if (msg.author?.id !== user?.id) {
          addMessage(msg.content, msg.author, msg.id)
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
  }, [addMessage, updateMessage, removeMessage, user?.id])

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
    return () => {
      console.log('[useSocket] Component unmounting, but keeping connection alive for potential reuse')
    }
  }, [])

  return {
    connect,
    disconnect,
    sendMessage,
    isConnected: wsService.isConnected(),
  }
}
