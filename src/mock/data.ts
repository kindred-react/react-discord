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
  embeds?: any[]
}

export const mockServers: Server[] = [
  { id: '1', name: 'Kindred', icon: 'K', color: '#5865f2', banner: 'https://images.unsplash.com/photo-1614680376593-902f74cf0d41?w=400' },
  { id: '2', name: 'Gaming', icon: '🎮', color: '#57F287' },
  { id: '3', name: 'Music', icon: '🎵', color: '#FEE75C' },
  { id: '4', name: 'Coding', icon: '💻', color: '#EB459E' },
  { id: '5', name: 'Anime', icon: '⚔️', color: '#FF6B6B' },
]

export const mockChannels: Channel[] = [
  { id: '1', name: '欢迎', type: 'text' },
  { id: '2', name: '规则', type: 'text' },
  { id: '3', name: '公告', type: 'text' },
  { id: '4', name: '综合', type: 'text' },
  { id: '5', name: '语音聊天', type: 'voice' },
  { id: '6', name: '音乐', type: 'voice' },
]

export const mockUsers: User[] = [
  { id: '1', username: 'Kindred', avatar: '', discriminator: '0001', status: 'online', role: 'admin' },
  { id: '2', username: 'Alice', avatar: '', discriminator: '1234', status: 'online' },
  { id: '3', username: 'Bob', avatar: '', discriminator: '5678', status: 'idle' },
  { id: '4', username: 'Charlie', avatar: '', discriminator: '9012', status: 'dnd' },
  { id: '5', username: 'Dave', avatar: '', discriminator: '3456', status: 'offline' },
]

export const mockMessages: Message[] = [
  {
    id: '1',
    content: '你好！欢迎来到 Discord 克隆项目 🎉',
    author: mockUsers[0],
    timestamp: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: '2',
    content: '这里可以聊天、分享文件、语音通话！',
    author: mockUsers[1],
    timestamp: new Date(Date.now() - 1800000).toISOString(),
  },
  {
    id: '3',
    content: '太棒了！期待更多功能',
    author: mockUsers[2],
    timestamp: new Date(Date.now() - 900000).toISOString(),
  },
]

export const mockDMs = [
  { id: '1', username: 'Alice', avatar: '', lastMessage: '晚上一起玩游戏吗？', unread: 2 },
  { id: '2', username: 'Bob', avatar: '', lastMessage: '好的', unread: 0 },
  { id: '3', username: 'Charlie', avatar: '', lastMessage: '收到！', unread: 5 },
]
