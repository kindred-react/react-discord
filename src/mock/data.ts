export interface Server {
  id: string
  name: string
  icon: string
  color: string
  banner?: string
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
  status: 'online' | 'idle' | 'dnd' | 'offline'
  role?: 'admin' | 'moderator' | 'member'
}

export interface Message {
  id: string
  content: string
  author: User
  timestamp: string
  attachments?: string[]
  embeds?: Embed[]
}

export interface Embed {
  title?: string
  description?: string
  url?: string
  color?: number
  image?: string
  thumbnail?: string
  author?: {
    name: string
    url?: string
    icon_url?: string
  }
  fields?: Array<{
    name: string
    value: string
    inline?: boolean
  }>
  footer?: {
    text: string
    icon_url?: string
  }
  timestamp?: string
}

export const mockServers: Server[] = [
  { id: '550e8400-e29b-41d4-a716-446655440000', name: 'Kindred', icon: 'K', color: '#5865f2', banner: 'https://images.unsplash.com/photo-1614680376593-902f74cf0d41?w=400' },
  { id: '550e8400-e29b-41d4-a716-446655440001', name: 'Gaming', icon: '🎮', color: '#57F287' },
  { id: '550e8400-e29b-41d4-a716-446655440002', name: 'Music', icon: '🎵', color: '#FEE75C' },
  { id: '550e8400-e29b-41d4-a716-446655440003', name: 'Coding', icon: '💻', color: '#EB459E' },
  { id: '550e8400-e29b-41d4-a716-446655440004', name: 'Anime', icon: '⚔️', color: '#FF6B6B' },
]

export const mockChannels: Channel[] = [
  { id: '6ba7b810-9dad-11d1-80b4-00c04fd430c1', name: '欢迎', type: 'text' },
  { id: '6ba7b810-9dad-11d1-80b4-00c04fd430c2', name: '规则', type: 'text' },
  { id: '6ba7b810-9dad-11d1-80b4-00c04fd430c3', name: '公告', type: 'text' },
  { id: '6ba7b810-9dad-11d1-80b4-00c04fd430c4', name: '综合', type: 'text' },
  { id: '6ba7b810-9dad-11d1-80b4-00c04fd430c5', name: '语音聊天', type: 'voice' },
  { id: '6ba7b810-9dad-11d1-80b4-00c04fd430c6', name: '音乐', type: 'voice' },
]

export const mockUsers: User[] = [
  { id: '8d5a16d0-4bd5-4d74-b235-98585e05452d', username: 'Kindred', avatar: '', discriminator: '0001', status: 'online', role: 'admin' },
  { id: '8d5a16d0-4bd5-4d74-b235-98585e05452e', username: 'Alice', avatar: '', discriminator: '1234', status: 'online' },
  { id: '8d5a16d0-4bd5-4d74-b235-98585e05452f', username: 'Bob', avatar: '', discriminator: '5678', status: 'idle' },
  { id: '8d5a16d0-4bd5-4d74-b235-98585e054530', username: 'Charlie', avatar: '', discriminator: '9012', status: 'dnd' },
  { id: '8d5a16d0-4bd5-4d74-b235-98585e054531', username: 'Dave', avatar: '', discriminator: '3456', status: 'offline' },
]

export const mockMessages: Message[] = [
  {
    id: 'f792950d1-62fd-4fff-a26d-3bdfa74c7be0',
    content: '你好！欢迎来到 Discord 克隆项目 🎉',
    author: mockUsers[0],
    timestamp: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 'f792950d1-62fd-4fff-a26d-3bdfa74c7be1',
    content: '这里可以聊天、分享文件、语音通话！',
    author: mockUsers[1],
    timestamp: new Date(Date.now() - 1800000).toISOString(),
  },
  {
    id: 'f792950d1-62fd-4fff-a26d-3bdfa74c7be2',
    content: '太棒了！期待更多功能',
    author: mockUsers[2],
    timestamp: new Date(Date.now() - 900000).toISOString(),
  },
]

export const mockDMs = [
  { id: '8d5a16d0-4bd5-4d74-b235-98585e05452e', username: 'Alice', avatar: '', lastMessage: '晚上一起玩游戏吗？', unread: 2 },
  { id: '8d5a16d0-4bd5-4d74-b235-98585e05452f', username: 'Bob', avatar: '', lastMessage: '好的', unread: 0 },
  { id: '8d5a16d0-4bd5-4d74-b235-98585e054530', username: 'Charlie', avatar: '', lastMessage: '收到！', unread: 5 },
]
