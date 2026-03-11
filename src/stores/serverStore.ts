import { create } from 'zustand'
import { mockMessages, mockUsers, mockDMs, type Server, type Channel, type Message, type User } from '../mock/data'

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
  dms: typeof mockDMs
  voiceChannel: VoiceChannelState
  fetchGuilds: (token: string) => Promise<void>
  fetchChannels: (guildId: string, token: string) => Promise<void>
  setCurrentServer: (server: Server) => void
  setCurrentChannel: (channel: Channel) => void
  addMessage: (content: string, author: User, id?: string) => void
  updateMessage: (messageId: string, content: string) => void
  removeMessage: (messageId: string) => void
  joinVoiceChannel: (channelId: string, user: User) => void
  leaveVoiceChannel: (userId: string) => void
}

export const useServerStore = create<ServerState>((set, get) => ({
  servers: [],
  currentServer: null,
  channels: [],
  currentChannel: null,
  messages: mockMessages,
  members: mockUsers,
  dms: mockDMs,
  voiceChannel: {
    channelId: null,
    participants: [],
  },

  fetchGuilds: async (token: string) => {
    try {
      const response = await fetch(`${API_BASE}/guilds`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
      if (response.ok) {
        const guilds = await response.json()
        const servers = guilds.map((g: any) => ({
          id: g.id,
          name: g.name,
          icon: g.icon || '',
          color: '#5865f2',
        }))
        set({ 
          servers,
          currentServer: servers[0] || null
        })
        if (servers[0]) {
          get().fetchChannels(servers[0].id, token)
        }
      }
    } catch (error) {
      console.error('Failed to fetch guilds:', error)
    }
  },

  fetchChannels: async (guildId: string, token: string) => {
    try {
      const response = await fetch(`${API_BASE}/guilds/${guildId}/channels`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
      if (response.ok) {
        const channels = await response.json()
        const formattedChannels = channels.map((c: any) => ({
          id: c.id,
          name: c.name,
          type: c.type,
          guildId: c.guild_id,
        }))
        const textChannels = formattedChannels.filter((c: Channel) => c.type === 'text')
        set({ 
          channels: formattedChannels as Channel[],
          currentChannel: textChannels[0] || null 
        })
      }
    } catch (error) {
      console.error('Failed to fetch channels:', error)
    }
  },
  
  setCurrentServer: (server) => {
    set({ currentServer: server })
  },
  
  setCurrentChannel: (channel) => {
    set({ currentChannel: channel })
  },
  
  addMessage: (content, author, id?: string) => {
    const newMessage: Message = {
      id: id || Date.now().toString(),
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
}))
