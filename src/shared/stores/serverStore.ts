import { create } from 'zustand'
import type { Server, Channel, Message, User } from '../types'

const API_BASE = '/api'

interface VoiceChannelState {
  channelId: string | null
  participants: User[]
}

interface ServerState {
  servers: Server[]
  currentServer: Server | null
  channels: Channel[]
  currentChannel: Channel | null
  messages: Message[]
  members: User[]
  voiceChannel: VoiceChannelState
  isLoading: boolean
  isLoadingMore: boolean
  hasMoreMessages: boolean
  messageOffset: number
  error: string | null
  fetchGuilds: (token: string) => Promise<void>
  fetchChannels: (guildId: string, token: string) => Promise<void>
  fetchMessages: (channelId: string, token: string) => Promise<void>
  loadMoreMessages: (channelId: string, token: string) => Promise<void>
  setCurrentServer: (server: Server) => void
  setCurrentChannel: (channel: Channel) => void
  setMessages: (messages: Message[]) => void
  addMessage: (content: string, author: User) => void
  addReceivedMessage: (message: Message) => void
  updateMessage: (messageId: string, content: string) => void
  removeMessage: (messageId: string) => void
  joinVoiceChannel: (channelId: string, user: User) => void
  leaveVoiceChannel: (userId: string) => void
  clearError: () => void
  createGuild: (name: string, token: string) => Promise<Server | null>
  joinGuildByInvite: (code: string, token: string) => Promise<{ guild: Server } | null>
  previewInvite: (code: string) => Promise<{ guild: { id: string; name: string; icon: string | null; member_count: number } } | null>
  generateInvite: (guildId: string, token: string, maxUses?: number, expireHours?: number) => Promise<string | null>
  checkMembership: (guildId: string, token: string) => Promise<boolean>
  leaveGuild: (guildId: string, token: string) => Promise<void>
  deleteGuild: (guildId: string, token: string) => Promise<void>
  createChannel: (guildId: string, name: string, type: 'text' | 'voice', token: string) => Promise<Channel>
  deleteChannel: (channelId: string, token: string) => Promise<void>
}

const mockMessages: Message[] = [
  {
    id: 'f792950d1-62fd-4fff-a26d-3bdfa74c7be0',
    content: '你好！欢迎来到 Discord 克隆项目 🎉',
    author: { id: '1', username: 'Kindred', avatar: '', discriminator: '0001', status: 'online', role: 'admin' },
    timestamp: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 'f792950d1-62fd-4fff-a26d-3bdfa74c7be1',
    content: '这里可以聊天、分享文件、语音通话！',
    author: { id: '2', username: 'Alice', avatar: '', discriminator: '1234', status: 'online' },
    timestamp: new Date(Date.now() - 1800000).toISOString(),
  },
  {
    id: 'f792950d1-62fd-4fff-a26d-3bdfa74c7be2',
    content: '太棒了！期待更多功能',
    author: { id: '3', username: 'Bob', avatar: '', discriminator: '5678', status: 'idle' },
    timestamp: new Date(Date.now() - 900000).toISOString(),
  },
]

const mockUsers: User[] = [
  { id: '1', username: 'Kindred', avatar: '', discriminator: '0001', status: 'online', role: 'admin' },
  { id: '2', username: 'Alice', avatar: '', discriminator: '1234', status: 'online' },
  { id: '3', username: 'Bob', avatar: '', discriminator: '5678', status: 'idle' },
  { id: '4', username: 'Charlie', avatar: '', discriminator: '9012', status: 'dnd' },
  { id: '5', username: 'Dave', avatar: '', discriminator: '3456', status: 'offline' },
]

export const useServerStore = create<ServerState>((set, get) => ({
  servers: [],
  currentServer: null,
  channels: [],
  currentChannel: null,
  messages: mockMessages,
  members: mockUsers,
  voiceChannel: {
    channelId: null,
    participants: [],
  },
  isLoading: false,
  isLoadingMore: false,
  hasMoreMessages: true,
  messageOffset: 0,
  error: null,

  fetchGuilds: async (token: string) => {
    set({ isLoading: true, error: null })
    try {
      const response = await fetch(`${API_BASE}/guilds`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
      if (response.ok) {
        const guilds = await response.json()
        interface GuildData { id: string; name: string; icon: string | null; owner_id: string }
        const servers: Server[] = (guilds as GuildData[]).map((g) => ({
          id: g.id,
          name: g.name,
          icon: g.icon || '',
          color: '#5865f2',
          ownerId: g.owner_id,
        }))
        set({ 
          servers,
          isLoading: false 
        })
      } else {
        set({ isLoading: false, error: 'Failed to fetch servers' })
      }
    } catch {
      set({ isLoading: false, error: 'Network error' })
    }
  },

  fetchChannels: async (guildId: string, token: string) => {
    set({ isLoading: true, error: null })
    try {
      const response = await fetch(`${API_BASE}/guilds/${guildId}/channels`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
      if (response.ok) {
        const channels = await response.json()
        interface ChannelData { id: string; name: string; type: string; guild_id: string }
        const formattedChannels = (channels as ChannelData[]).map((c): Channel => ({
          id: c.id,
          name: c.name,
          type: c.type as Channel['type'],
          guildId: c.guild_id,
        }))
        set({ 
          channels: formattedChannels,
          isLoading: false 
        })
      } else {
        set({ isLoading: false, error: 'Failed to fetch channels' })
      }
    } catch {
      set({ isLoading: false, error: 'Network error' })
    }
  },

  fetchMessages: async (channelId: string, token: string) => {
    set({ isLoading: true, error: null, messageOffset: 0, hasMoreMessages: true })
    try {
      const response = await fetch(`${API_BASE}/channels/${channelId}/messages?limit=10&offset=0`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
      if (response.ok) {
        const data = await response.json()
        const backendMessages = data.messages || data
        const total = data.total || 0
        
        const messages: Message[] = (backendMessages as Record<string, unknown>[]).map((msg) => ({
          id: msg.id as string,
          content: msg.content as string,
          type: (msg.type as Message['type']) || 'text',
          voice_url: msg.voice_url as string | undefined,
          duration: msg.duration as number | undefined,
          attachments: (msg.attachments as Message['attachments']) || [],
          author: msg.author ? {
            id: (msg.author as Record<string, string>).id,
            username: (msg.author as Record<string, string>).username,
            avatar: (msg.author as Record<string, string>).avatar || '',
            discriminator: (msg.author as Record<string, string>).discriminator || '0001',
          } : { id: 'unknown', username: 'Unknown', avatar: '', discriminator: '0000' },
          timestamp: (msg.created_at as string) || (msg.timestamp as string) || new Date().toISOString(),
        }))
        // 反转消息顺序，最新的在最下面
        messages.reverse()
        set({ 
          messages, 
          messageOffset: messages.length,
          hasMoreMessages: total > messages.length,
          isLoading: false 
        })
      } else {
        set({ isLoading: false, error: 'Failed to fetch messages' })
      }
    } catch {
      set({ isLoading: false, error: 'Network error' })
    }
  },

  loadMoreMessages: async (channelId: string, token: string) => {
    const { messageOffset, isLoadingMore } = get()
    if (isLoadingMore) return
    
    set({ isLoadingMore: true, error: null })
    try {
      const response = await fetch(`${API_BASE}/channels/${channelId}/messages?limit=20&offset=${messageOffset}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
      if (response.ok) {
        const data = await response.json()
        const backendMessages = data.messages || data
        const total = data.total || 0
        
        const newMessages: Message[] = (backendMessages as Record<string, unknown>[]).map((msg) => ({
          id: msg.id as string,
          content: msg.content as string,
          type: (msg.type as Message['type']) || 'text',
          voice_url: msg.voice_url as string | undefined,
          duration: msg.duration as number | undefined,
          attachments: (msg.attachments as Message['attachments']) || [],
          author: msg.author ? {
            id: (msg.author as Record<string, string>).id,
            username: (msg.author as Record<string, string>).username,
            avatar: (msg.author as Record<string, string>).avatar || '',
            discriminator: (msg.author as Record<string, string>).discriminator || '0001',
          } : { id: 'unknown', username: 'Unknown', avatar: '', discriminator: '0000' },
          timestamp: (msg.created_at as string) || (msg.timestamp as string) || new Date().toISOString(),
        }))
        // 反转消息顺序
        newMessages.reverse()
        
        set((state) => { 
          // 去重：过滤掉已存在的消息
          const existingIds = new Set(state.messages.map((m) => m.id))
          const uniqueNew = newMessages.filter((m) => !existingIds.has(m.id))
          return {
            messages: [...uniqueNew, ...state.messages],
            messageOffset: state.messageOffset + newMessages.length,
            hasMoreMessages: (state.messageOffset + newMessages.length) < total,
            isLoadingMore: false,
          }
        })
      } else {
        set({ isLoadingMore: false, error: 'Failed to load more messages' })
      }
    } catch {
      set({ isLoadingMore: false, error: 'Network error' })
    }
  },
  
  setCurrentServer: (server) => {
    set({ currentServer: server, channels: [], currentChannel: null, messages: [] })
  },
  
  setCurrentChannel: (channel) => {
    set({ currentChannel: channel, messages: [], messageOffset: 0, hasMoreMessages: true })
  },

  setMessages: (messages) => {
    set({ messages })
  },
  
  addMessage: (content: string, author: User) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      content,
      author,
      timestamp: new Date().toISOString(),
    }
    set((state) => ({
      messages: [...state.messages, newMessage],
    }))
  },

  addReceivedMessage: (message: Message) => {
    set((state) => {
      // 去重：如果消息 id 已存在则跳过
      if (state.messages.some((m) => m.id === message.id)) return state
      return { messages: [...state.messages, message] }
    })
  },

  updateMessage: (messageId, content) => {
    set((state) => ({
      messages: state.messages.map((msg) =>
        msg.id === messageId ? { ...msg, content } : msg
      ),
    }))
  },

  removeMessage: (messageId) => {
    set((state) => ({
      messages: state.messages.filter((msg) => msg.id !== messageId),
    }))
  },

  joinVoiceChannel: (channelId, user) => {
    set((state) => ({
      voiceChannel: {
        channelId,
        participants: [...state.voiceChannel.participants.filter(p => p.id !== user.id), user],
      },
    }))
  },

  leaveVoiceChannel: (userId) => {
    set((state) => ({
      voiceChannel: {
        ...state.voiceChannel,
        participants: state.voiceChannel.participants.filter((p) => p.id !== userId),
      },
    }))
  },

  clearError: () => set({ error: null }),

  createGuild: async (name: string, token: string) => {
    try {
      const response = await fetch(`${API_BASE}/guilds`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ name }),
      })
      if (!response.ok) return null
      const g = await response.json()
      const server: Server = { id: g.id, name: g.name, icon: g.icon || '', color: '#5865f2' }
      set((state) => ({ servers: [...state.servers, server] }))
      return server
    } catch {
      return null
    }
  },

  previewInvite: async (code: string) => {
    try {
      const response = await fetch(`${API_BASE}/invites/${code.trim()}`)
      if (!response.ok) return null
      return await response.json()
    } catch {
      return null
    }
  },

  joinGuildByInvite: async (code: string, token: string) => {
    const response = await fetch(`${API_BASE}/invites/${code.trim()}`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
    })
    if (!response.ok) {
      const err = await response.json().catch(() => ({} as Record<string, string>))
      throw new Error((err as Record<string, string>).error || '加入失败')
    }
    const data = await response.json()
    const server: Server = {
      id: data.guild.id,
      name: data.guild.name,
      icon: data.guild.icon || '',
      color: '#5865f2',
    }
    set((state) => ({
      servers: state.servers.find(s => s.id === server.id)
        ? state.servers
        : [...state.servers, server],
    }))
    return { guild: server }
  },

  generateInvite: async (guildId: string, token: string, maxUses = 0, expireHours = 24) => {
    try {
      const response = await fetch(`${API_BASE}/guilds/${guildId}/invites`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ max_uses: maxUses, expire_hours: expireHours }),
      })
      if (!response.ok) return null
      const data = await response.json()
      return data.code as string
    } catch {
      return null
    }
  },

  checkMembership: async (guildId: string, token: string) => {
    try {
      const response = await fetch(`${API_BASE}/guilds`, {
        headers: { 'Authorization': `Bearer ${token}` },
      })
      if (!response.ok) return false
      const guilds = await response.json() as Array<{ id: string }>
      return guilds.some((g) => g.id === guildId)
    } catch {
      return false
    }
  },

  leaveGuild: async (guildId: string, token: string) => {
    const response = await fetch(`${API_BASE}/guilds/${guildId}/leave`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` },
    })
    if (!response.ok) {
      const err = await response.json().catch(() => ({} as Record<string, string>))
      throw new Error((err as Record<string, string>).error || '退出失败')
    }
    set((state) => ({
      servers: state.servers.filter((s) => s.id !== guildId),
      currentServer: state.currentServer?.id === guildId ? null : state.currentServer,
      channels: state.currentServer?.id === guildId ? [] : state.channels,
      currentChannel: state.currentServer?.id === guildId ? null : state.currentChannel,
    }))
  },

  deleteGuild: async (guildId: string, token: string) => {
    const response = await fetch(`${API_BASE}/guilds/${guildId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` },
    })
    if (!response.ok) {
      const err = await response.json().catch(() => ({} as Record<string, string>))
      throw new Error((err as Record<string, string>).error || '删除失败')
    }
    set((state) => ({
      servers: state.servers.filter((s) => s.id !== guildId),
      currentServer: state.currentServer?.id === guildId ? null : state.currentServer,
      channels: state.currentServer?.id === guildId ? [] : state.channels,
      currentChannel: state.currentServer?.id === guildId ? null : state.currentChannel,
    }))
  },

  createChannel: async (guildId: string, name: string, type: 'text' | 'voice', token: string) => {
    const response = await fetch(`${API_BASE}/guilds/${guildId}/channels`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ name, type }),
    })
    if (!response.ok) {
      const err = await response.json().catch(() => ({} as Record<string, string>))
      throw new Error((err as Record<string, string>).error || '创建失败')
    }
    const channel = await response.json() as { id: string; name: string; type: 'text' | 'voice' | 'category'; guild_id: string }
    const newChannel: Channel = { id: channel.id, name: channel.name, type: channel.type, guildId: channel.guild_id }
    set((state) => ({ channels: [...state.channels, newChannel] }))
    return newChannel
  },

  deleteChannel: async (channelId: string, token: string) => {
    const response = await fetch(`${API_BASE}/channels/${channelId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` },
    })
    if (!response.ok) {
      const err = await response.json().catch(() => ({} as Record<string, string>))
      throw new Error((err as Record<string, string>).error || '删除失败')
    }
    set((state) => ({
      channels: state.channels.filter((c) => c.id !== channelId),
      currentChannel: state.currentChannel?.id === channelId ? null : state.currentChannel,
    }))
  },
}))

export { mockUsers }
