import { create } from 'zustand'
import { mockServers, mockChannels, mockMessages, mockUsers, mockDMs, type Server, type Channel, type Message, type User } from '../mock/data'

interface ServerState {
  servers: Server[]
  currentServer: Server | null
  channels: Channel[]
  currentChannel: Channel | null
  messages: Message[]
  members: User[]
  dms: typeof mockDMs
  setCurrentServer: (server: Server) => void
  setCurrentChannel: (channel: Channel) => void
  addMessage: (content: string, author: User) => void
}

export const useServerStore = create<ServerState>((set) => ({
  servers: mockServers,
  currentServer: mockServers[0],
  channels: mockChannels,
  currentChannel: mockChannels.find(c => c.type === 'text') || null,
  messages: mockMessages,
  members: mockUsers,
  dms: mockDMs,
  
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
}))
