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
  error: string | null
  fetchGuilds: (token: string) => Promise<void>
  fetchChannels: (guildId: string, token: string) => Promise<void>
  fetchMessages: (channelId: string, token: string) => Promise<void>
  setCurrentServer: (server: Server) => void
  setCurrentChannel: (channel: Channel) => void
  addMessage: (content: string, author: User) => void
  updateMessage: (messageId: string, content: string) => void
  removeMessage: (messageId: string) => void
  joinVoiceChannel: (channelId: string, user: User) => void
  leaveVoiceChannel: (userId: string) => void
  clearError: () => void
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
        interface GuildData { id: string; name: string; icon: string | null }
        const servers: Server[] = (guilds as GuildData[]).map((g) => ({
          id: g.id,
          name: g.name,
          icon: g.icon || '',
          color: '#5865f2',
        }))
        set({ 
          servers,
          currentServer: servers[0] || null,
          isLoading: false 
        })
        if (servers[0]) {
          get().fetchChannels(servers[0].id, token)
        }
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
        const textChannels = formattedChannels.filter((c) => c.type === 'text')
        set({ 
          channels: formattedChannels,
          currentChannel: textChannels[0] || null,
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
    set({ isLoading: true, error: null })
    try {
      const response = await fetch(`${API_BASE}/channels/${channelId}/messages`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
      if (response.ok) {
        const messages = await response.json()
        set({ messages: messages as Message[], isLoading: false })
      } else {
        set({ isLoading: false, error: 'Failed to fetch messages' })
      }
    } catch {
      set({ isLoading: false, error: 'Network error' })
    }
  },
  
  setCurrentServer: (server) => {
    set({ currentServer: server })
  },
  
  setCurrentChannel: (channel) => {
    set({ currentChannel: channel })
  },
  
  addMessage: (content, author) => {
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
}))

export { mockUsers }
