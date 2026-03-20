export interface Server {
  id: string
  name: string
  icon: string
  color: string
  banner?: string
  ownerId?: string
}

export interface Channel {
  id: string
  name: string
  type: 'text' | 'voice' | 'category'
  parentId?: string
  guildId?: string
}

export interface User {
  id: string
  username: string
  avatar: string
  discriminator: string
  status?: 'online' | 'idle' | 'dnd' | 'offline'
  role?: 'admin' | 'moderator' | 'member'
}

export interface Message {
  id: string
  content: string
  type?: 'text' | 'image' | 'file' | 'voice' | 'gif' | 'sticker' | 'call_record' | 'gift'
  voice_url?: string
  duration?: number
  author: User
  timestamp: string
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
  embeds?: Record<string, unknown>[]
}

export interface VoiceChannelParticipant {
  user: User
  isMuted: boolean
  isDeafened: boolean
  isSpeaking: boolean
}

export interface AuthResponse {
  user: {
    id: string
    username: string
    avatar: string | null
    discriminator: string
    email?: string
  }
  token: string
}

export interface GuildResponse {
  id: string
  name: string
  icon: string | null
}

export interface ChannelResponse {
  id: string
  name: string
  type: string
  guild_id: string
}
