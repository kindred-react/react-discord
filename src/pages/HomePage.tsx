import { useState, useEffect, useRef } from 'react'
import {
  Hash, Volume2, Headphones, Plus, Settings, Users, Compass, Pin,
  Download, Mic, MicOff, ChevronDown, ChevronRight, Search, Inbox,
} from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import { useUserStore } from '../shared/stores/userStore'
import { useServerStore } from '../shared/stores/serverStore'
import { type Channel } from '../shared/types'
import { Modal } from '../components/Modal'
import { AddChannelModal } from '../components/AddChannelModal'
import { DownloadAppModal } from '../components/DownloadAppModal'
import { VoiceChannelPanel } from '../components/VoiceChannelPanel'
import { VoiceMessageRecorder } from '../components/VoiceMessageRecorder'
import { EmojiPicker } from '../components/EmojiPicker'
import { GifPicker } from '../components/GifPicker'
import { StickerPicker } from '../components/StickerPicker'
import { GiftPicker, type Gift } from '../components/GiftPicker'
import { MessageItem } from '../components/MessageItem'
import { LoadMoreMessages } from '../components/LoadMoreMessages'
import { JoinServerModal } from '../components/JoinServerModal'
import { CreateServerModal } from '../components/CreateServerModal'
import { InviteModal } from '../components/InviteModal'
import { useSocket } from '../hooks/useSocket'

function Tooltip({ label, side = 'top', children }: { label: string; side?: 'top' | 'right'; children: React.ReactNode }) {
  const pos = side === 'right' ? 'left-[calc(100%+8px)] top-1/2 -translate-y-1/2' : 'bottom-[calc(100%+6px)] left-1/2 -translate-x-1/2'
  const arrow = side === 'right' ? 'absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-[#111214]' : 'absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#111214]'
  return (
    <div className="relative group/tt">
      {children}
      <div className={`pointer-events-none absolute ${pos} z-[200] px-2.5 py-1.5 bg-[#111214] text-white text-xs font-semibold rounded-[4px] whitespace-nowrap opacity-0 group-hover/tt:opacity-100 transition-opacity duration-100 shadow-xl`}>
        {label}
        <div className={arrow} />
      </div>
    </div>
  )
}

function ServerRailItem({ label, isActive, children }: { label: string; isActive?: boolean; children: React.ReactNode }) {
  return (
    <div className="relative group/rail w-full flex justify-center flex-shrink-0">
      <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 bg-white rounded-r-full transition-all duration-150 ${ isActive ? 'h-10 opacity-100' : 'h-5 opacity-0 group-hover/rail:opacity-100 group-hover/rail:h-5' }`} />
      {children}
      <div className="pointer-events-none absolute left-[68px] top-1/2 -translate-y-1/2 ml-1 px-3 py-2 bg-[#111214] text-white text-sm font-bold rounded-[4px] whitespace-nowrap opacity-0 group-hover/rail:opacity-100 transition-opacity duration-100 shadow-2xl z-[200]">
        {label}
        <div className="absolute right-full top-1/2 -translate-y-1/2 border-[6px] border-transparent border-r-[#111214]" />
      </div>
    </div>
  )
}

function ChannelWelcomeHeader({ channel, serverName }: { channel: Channel | null; serverName?: string }) {
  const name = channel?.name || 'general'
  const isSpecial = name.includes('欢迎') || name.includes('规则') || name.includes('welcome') || name.includes('rules') || name.includes('announce')
  if (isSpecial) {
    return (
      <div className="px-4 pt-10 pb-0 flex-shrink-0">
        <div className="relative rounded-xl overflow-hidden mb-5" style={{ background: 'linear-gradient(135deg,#5865f2 0%,#4752c4 40%,#3c45a5 100%)', minHeight: 120 }}>
          <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 80% 50%,rgba(255,255,255,.10) 0%,transparent 70%)' }} />
          <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: 'repeating-linear-gradient(0deg,#fff 0,#fff 1px,transparent 1px,transparent 32px),repeating-linear-gradient(90deg,#fff 0,#fff 1px,transparent 1px,transparent 32px)' }} />
          <div className="relative z-10 flex items-center gap-5 px-6 py-5">
            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0 shadow-lg border border-white/20">
              <Hash size={34} className="text-white" strokeWidth={2.5} />
            </div>
            <div>
              <div className="text-white/70 text-[11px] font-semibold uppercase tracking-widest mb-0.5">{serverName || 'SERVER'}</div>
              <h1 className="text-white text-2xl font-black leading-tight"># {name}</h1>
              <p className="text-white/75 text-sm mt-1">这是这个频道的起点，欢迎来到社区！</p>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-2 mb-5">
          {[
            { icon: '📜', color: '#5865f2', title: '遵守社区规则', desc: '请尊重所有成员，保持友善的交流氛围。禁止发布仇恨言论、骚扰或违法内容。' },
            { icon: '🤝', color: '#23a55a', title: '友善互助', desc: '积极帮助他人，分享知识和经验。我们鼓励建设性的讨论和学习。' },
            { icon: '📣', color: '#f0b232', title: '发布相关内容', desc: '请在正确的频道发布内容，保持频道整洁有序。广告须获管理员批准。' },
            { icon: '🛡️', color: '#ed4245', title: '服从管理决定', desc: '管理员和版主的决定是最终的。如有异议请私信管理员沟通，不得公开抱怨。' },
          ].map((r) => (
            <div key={r.title} className="flex items-start gap-3 bg-[#2b2d31] hover:bg-[#2e3035] transition-colors rounded-lg px-4 py-3 border border-[#3f4147]/60">
              <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: r.color + '33' }}><span className="text-base">{r.icon}</span></div>
              <div><p className="text-white text-sm font-semibold mb-0.5">{r.title}</p><p className="text-[#949ba4] text-xs leading-relaxed">{r.desc}</p></div>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-3 mb-2">
          <div className="flex-1 h-px bg-[#3f4147]" />
          <span className="text-[#949ba4] text-[11px] whitespace-nowrap">频道创建于服务器建立时</span>
          <div className="flex-1 h-px bg-[#3f4147]" />
        </div>
      </div>
    )
  }
  return (
    <div className="px-4 pt-16 pb-4 flex-shrink-0">
      <div className="w-16 h-16 bg-[#43444b] rounded-full flex items-center justify-center mb-4"><Hash size={36} className="text-white" strokeWidth={2.5} /></div>
      <h1 className="text-[28px] font-black text-white mb-2">欢迎来到 #{name}！</h1>
      <p className="text-[#b5bac1] text-base mb-4">这是 <strong className="text-white">#{name}</strong> 频道的起点。</p>
      <div className="h-px bg-[#3f4147] mt-4" />
    </div>
  )
}

function UserSettingsModal({ onClose }: { onClose: () => void }) {
  const user = useUserStore((s) => s.user)
  const logout = useUserStore((s) => s.logout)
  const navigate = useNavigate()
  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60" />
      <div className="relative bg-[#313338] rounded-lg shadow-2xl w-[460px] overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="h-24 bg-gradient-to-r from-[#5865f2] to-[#4752c4] relative">
          <button onClick={onClose} className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full bg-black/20 hover:bg-black/40 text-white transition-colors">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18.4 4L12 10.4L5.6 4L4 5.6L10.4 12L4 18.4L5.6 20L12 13.6L18.4 20L20 18.4L13.6 12L20 5.6L18.4 4Z" /></svg>
          </button>
        </div>
        <div className="px-4 pb-5">
          <div className="-mt-8 mb-4">
            <div className="w-16 h-16 rounded-full bg-[#5865f2] border-4 border-[#313338] flex items-center justify-center text-white text-2xl font-bold">{user?.username?.[0]?.toUpperCase() || 'U'}</div>
          </div>
          <div className="bg-[#1e1f22] rounded-lg p-3 mb-2"><p className="text-[#b5bac1] text-[11px] font-semibold uppercase tracking-wide mb-0.5">用户名</p><p className="text-white font-semibold">{user?.username || 'User'}</p></div>
          <div className="bg-[#1e1f22] rounded-lg p-3 mb-4"><p className="text-[#b5bac1] text-[11px] font-semibold uppercase tracking-wide mb-0.5">标签</p><p className="text-white font-semibold">#{user?.discriminator || '0000'}</p></div>
          <button onClick={() => { logout(); navigate('/login') }} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg bg-[#f23f43]/10 hover:bg-[#f23f43]/20 text-[#f23f43] transition-colors font-semibold text-sm">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M16 13v-2H7V8l-5 4 5 4v-3z"/><path d="M20 3h-9a2 2 0 00-2 2v4h2V5h9v14h-9v-4H9v4a2 2 0 002 2h9a2 2 0 002-2V5a2 2 0 00-2-2z"/></svg>
            退出登录
          </button>
        </div>
      </div>
    </div>
  )
}

export function HomePage() {
  const user = useUserStore((s) => s.user)
  const token = useUserStore((s) => s.token)
  const navigate = useNavigate()
  const { guildId: urlGuildId, channelId: urlChannelId } = useParams<{ guildId?: string; channelId?: string }>()
  const {
    servers, currentServer, channels, currentChannel,
    messages, members, isLoadingMore, hasMoreMessages,
    fetchGuilds, fetchChannels, fetchMessages, loadMoreMessages,
    setCurrentServer, setCurrentChannel, leaveGuild, deleteGuild, deleteChannel,
  } = useServerStore()

  const [messageInput, setMessageInput] = useState('')
  const [showMembers, setShowMembers] = useState(true)
  const [showAddChannelModal, setShowAddChannelModal] = useState(false)
  const [showDownloadModal, setShowDownloadModal] = useState(false)
  const [showAddServerModal, setShowAddServerModal] = useState(false)
  const [showJoinServerModal, setShowJoinServerModal] = useState(false)
  const [showCreateServerModal, setShowCreateServerModal] = useState(false)
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [showServerMenu, setShowServerMenu] = useState(false)
  const [showUserSettings, setShowUserSettings] = useState(false)
  const [textCategoryOpen, setTextCategoryOpen] = useState(true)
  const [voiceCategoryOpen, setVoiceCategoryOpen] = useState(true)
  const [isMuted, setIsMuted] = useState(false)
  const [isDeafened, setIsDeafened] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeVoiceChannel, setActiveVoiceChannel] = useState<Channel | null>(null)
  const [isUploadingVoice, setIsUploadingVoice] = useState(false)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [showGifPicker, setShowGifPicker] = useState(false)
  const [showStickerPicker, setShowStickerPicker] = useState(false)
  const [showGiftPicker, setShowGiftPicker] = useState(false)
  const [previousMessageCount, setPreviousMessageCount] = useState(0)
  const serverMenuRef = useRef<HTMLDivElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const { sendMessage: sendSocketMessage } = useSocket()

  useEffect(() => {
    if (!showServerMenu) return
    const handler = (e: MouseEvent) => {
      if (serverMenuRef.current && !serverMenuRef.current.contains(e.target as Node)) setShowServerMenu(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [showServerMenu])

  useEffect(() => {
    if (!user?.id || !token) return
    fetchGuilds(token).then(() => {
      const { servers } = useServerStore.getState()
      if (!servers.length) return
      const target = urlGuildId ? (servers.find((s) => s.id === urlGuildId) ?? servers[0]) : servers[0]
      setCurrentServer(target)
      fetchChannels(target.id, token).then(() => {
        const { channels } = useServerStore.getState()
        const text = channels.filter((c) => c.type === 'text')
        if (!text.length) return
        const ch = urlChannelId ? (text.find((c) => c.id === urlChannelId) ?? text[0]) : text[0]
        setCurrentChannel(ch)
        const path = `/channels/${target.id}/${ch.id}`
        if (window.location.pathname !== path) navigate(path, { replace: true })
      })
    })
  }, [user?.id, token])

  useEffect(() => {
    if (currentChannel && token) {
      fetchMessages(currentChannel.id, token)
      setPreviousMessageCount(0)
    }
  }, [currentChannel?.id, token])

  useEffect(() => {
    if (messages.length > previousMessageCount) {
      if (messages.length - previousMessageCount === 1) {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
      }
      setPreviousMessageCount(messages.length)
    }
  }, [messages, previousMessageCount])

  const handleServerClick = (server: { id: string; name: string; icon: string; color: string; ownerId?: string }) => {
    setCurrentServer(server)
    if (token) {
      fetchChannels(server.id, token).then(() => {
        const { channels } = useServerStore.getState()
        const text = channels.filter((c) => c.type === 'text')
        if (text.length > 0) {
          setCurrentChannel(text[0])
          navigate(`/channels/${server.id}/${text[0].id}`)
        } else {
          navigate(`/channels/${server.id}`)
        }
      })
    }
  }

  const handleSendMessage = () => {
    if (messageInput.trim() && user) {
      sendSocketMessage(messageInput)
      setMessageInput('')
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage() }
  }

  const handleFileUpload = async () => {
    if (!currentChannel || !token) { alert('请先选择一个频道'); return }
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*,video/*,.pdf,.doc,.docx'
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return
      try {
        const formData = new FormData()
        formData.append('channel_id', currentChannel.id)
        const isImage = file.type.startsWith('image/')
        formData.append(isImage ? 'image' : 'file', file)
        const endpoint = isImage ? '/api/files/image' : '/api/files/upload'
        const response = await fetch(endpoint, { method: 'POST', headers: { 'Authorization': `Bearer ${token}` }, body: formData })
        if (response.ok) { fetchMessages(currentChannel.id, token) }
        else { alert(`上传失败: ${await response.text()}`) }
      } catch (err) { alert(`上传失败: ${err}`) }
    }
    input.click()
  }

  const handleAddEmoji = (emoji: string) => setMessageInput(prev => prev + emoji)

  const handleAddGif = async (gifUrl: string) => {
    if (!currentChannel || !token) return
    const res = await fetch('/api/files/gif', { method: 'POST', headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ channel_id: currentChannel.id, gif_url: gifUrl, title: 'GIF' }) })
    if (res.ok) fetchMessages(currentChannel.id, token)
  }

  const handleAddSticker = async (sticker: string) => {
    if (!currentChannel || !token) return
    const res = await fetch('/api/files/sticker', { method: 'POST', headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ channel_id: currentChannel.id, sticker }) })
    if (res.ok) fetchMessages(currentChannel.id, token)
  }

  const handleSendGift = async (gift: Gift) => {
    if (!currentChannel || !token) return
    const res = await fetch('/api/gifts/send', { method: 'POST', headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ channel_id: currentChannel.id, gift_id: gift.id, gift_name: gift.name, gift_emoji: gift.emoji, gift_price: gift.price }) })
    if (res.ok) fetchMessages(currentChannel.id, token)
  }

  const handleLoadMoreMessages = async () => {
    if (!currentChannel || !token || !messagesContainerRef.current) return
    const container = messagesContainerRef.current
    const before = container.scrollHeight
    const top = container.scrollTop
    await loadMoreMessages(currentChannel.id, token)
    requestAnimationFrame(() => { container.scrollTop = top + (container.scrollHeight - before) })
  }

  const handleVoiceMessageSend = async (blob: Blob, duration: number) => {
    if (!currentChannel || !token) return
    try {
      setIsUploadingVoice(true)
      const formData = new FormData()
      formData.append('voice', blob, 'voice-message.webm')
      formData.append('channel_id', currentChannel.id)
      formData.append('duration', duration.toString())
      const res = await fetch('/api/voice/message', { method: 'POST', headers: { 'Authorization': `Bearer ${token}` }, body: formData })
      if (res.ok) fetchMessages(currentChannel.id, token)
    } finally { setIsUploadingVoice(false) }
  }

  const textChannels = channels.filter(c => c.type === 'text')
  const voiceChannels = channels.filter(c => c.type === 'voice')
  const isOwner = user && currentServer?.ownerId === user.id

  return (
    <div className="flex h-screen bg-[#313338] overflow-hidden">
      {/* ── Server Rail ── */}
      <div className="w-[72px] bg-[#1e1f22] flex flex-col items-center py-3 gap-2 flex-shrink-0">
        <ServerRailItem label="私信">
          <div className="w-12 h-12 bg-[#313338] rounded-[24px] flex items-center justify-center cursor-pointer hover:rounded-[16px] hover:bg-[#5865f2] transition-all duration-200 flex-shrink-0">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="white"><path d="M19.73 4.87a18.2 18.2 0 00-4.06-1.26 12.18 12.18 0 00-.56 1.15 16.69 16.69 0 00-5.02 0c-.18-.39-.37-.77-.57-1.15a18.18 18.18 0 00-4.07 1.27A19.16 19.16 0 002.42 18a17.43 17.43 0 005.26 2.65 12.6 12.6 0 001.07-1.75 11.37 11.37 0 01-1.69-.83 10.71 10.71 0 00.42-.33 12.15 12.15 0 0010.04 0c.14.11.28.22.42.33-.54.32-1.1.59-1.7.84a12.5 12.5 0 001.07 1.74 17.37 17.37 0 005.27-2.65 19.15 19.15 0 00-3.31-13.13zM8.68 15.26c-1.08 0-1.97-1-1.97-2.23s.87-2.24 1.97-2.24 1.99 1 1.97 2.24c0 1.23-.87 2.23-1.97 2.23zm6.64 0c-1.08 0-1.97-1-1.97-2.23s.87-2.24 1.97-2.24 1.98 1 1.97 2.24c0 1.23-.87 2.23-1.97 2.23z"/></svg>
          </div>
        </ServerRailItem>
        <div className="w-8 h-px bg-[#35363c] rounded-full flex-shrink-0" />
        <div className="flex-1 w-full overflow-y-auto flex flex-col items-center gap-2" style={{ scrollbarWidth: 'none' }}>
          {servers.map((server) => {
            const isActive = currentServer?.id === server.id
            const initials = server.name.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase()
            return (
              <ServerRailItem key={server.id} label={server.name} isActive={isActive}>
                <div
                  onClick={() => handleServerClick(server)}
                  className={`w-12 h-12 flex items-center justify-center cursor-pointer transition-all duration-200 font-semibold text-white overflow-hidden flex-shrink-0 ${
                    isActive ? 'rounded-[16px] bg-[#5865f2]' : 'rounded-full bg-[#36393f] hover:rounded-[16px] hover:bg-[#5865f2]'
                  }`}
                >
                  {server.icon
                    ? <img src={server.icon} alt={server.name} className="w-full h-full object-cover" />
                    : <span className="text-[13px] font-semibold px-1 text-center leading-tight select-none">{initials}</span>
                  }
                </div>
              </ServerRailItem>
            )
          })}
        </div>
        <div className="w-8 h-px bg-[#35363c] rounded-full flex-shrink-0" />
        <ServerRailItem label="添加服务器">
          <div onClick={() => setShowAddServerModal(true)} className="w-12 h-12 bg-[#36393f] rounded-full flex items-center justify-center text-[#23a55a] cursor-pointer hover:rounded-[16px] hover:bg-[#23a55a] hover:text-white transition-all duration-200 flex-shrink-0">
            <Plus size={22} />
          </div>
        </ServerRailItem>
        <ServerRailItem label="探索公开服务器">
          <div className="w-12 h-12 bg-[#36393f] rounded-full flex items-center justify-center text-[#23a55a] cursor-pointer hover:rounded-[16px] hover:bg-[#23a55a] hover:text-white transition-all duration-200 flex-shrink-0">
            <Compass size={22} />
          </div>
        </ServerRailItem>
        <ServerRailItem label="下载应用">
          <div onClick={() => setShowDownloadModal(true)} className="w-12 h-12 bg-[#36393f] rounded-full flex items-center justify-center text-[#87898c] cursor-pointer hover:rounded-[16px] hover:bg-[#3a3c43] hover:text-[#dbdee1] transition-all duration-200 flex-shrink-0">
            <Download size={20} />
          </div>
        </ServerRailItem>
      </div>

      {/* ── Channel Sidebar ── */}
      <div className="w-60 bg-[#2b2d31] flex flex-col flex-shrink-0">
        {/* Server name header — matches Discord's title bar with shadow separator */}
        <div
          ref={serverMenuRef}
          className="relative h-12 px-3 flex items-center justify-between cursor-pointer hover:bg-[#35373c] transition-colors duration-150 flex-shrink-0"
          style={{ boxShadow: '0 1px 0 rgba(4,4,5,0.2), 0 1.5px 0 rgba(6,6,7,0.05), 0 2px 0 rgba(4,4,5,0.05)' }}
          onClick={() => setShowServerMenu(!showServerMenu)}
        >
          <h2 className="text-white font-bold text-[15px] truncate flex-1 leading-5 select-none">{currentServer?.name || 'Discord'}</h2>
          {showServerMenu
            ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-[#dbdee1] flex-shrink-0"><path d="M6 15l6-6 6 6"/></svg>
            : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-[#b5bac1] flex-shrink-0"><path d="M6 9l6 6 6-6"/></svg>
          }
          {showServerMenu && currentServer && (
            <div
              className="absolute top-[calc(100%+4px)] left-2 right-2 bg-[#111214] border border-[#3f4147]/60 rounded-[4px] shadow-2xl z-50 p-[6px]"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => { setShowServerMenu(false); setShowInviteModal(true) }}
                className="w-full flex items-center justify-between px-2 py-[6px] rounded-[2px] text-[#00a8fc] hover:bg-[#5865f2] hover:text-white transition-colors text-sm font-medium"
              >
                <span>邀请好友</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M15 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm-9-2V7H4v3H1v2h3v3h2v-3h3v-2H6zm9 4c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
              </button>
              <button
                onClick={() => { setShowServerMenu(false); setShowAddChannelModal(true) }}
                className="w-full flex items-center justify-between px-2 py-[6px] rounded-[2px] text-[#dbdee1] hover:bg-[#5865f2] hover:text-white transition-colors text-sm font-medium"
              >
                <span>创建频道</span><Plus size={16} />
              </button>
              <button
                className="w-full flex items-center justify-between px-2 py-[6px] rounded-[2px] text-[#dbdee1] hover:bg-[#5865f2] hover:text-white transition-colors text-sm font-medium"
              >
                <span>服务器设置</span>
                <Settings size={16} />
              </button>
              <div className="my-1 mx-2 border-t border-[#3f4147]" />
              {isOwner ? (
                <button
                  onClick={async () => {
                    if (!token || !currentServer) return
                    if (!window.confirm(`确定要删除服务器「${currentServer.name}」吗？此操作不可恢复。`)) return
                    setShowServerMenu(false)
                    try { await deleteGuild(currentServer.id, token); navigate('/') }
                    catch (e: unknown) { alert(e instanceof Error ? e.message : '删除失败') }
                  }}
                  className="w-full flex items-center justify-between px-2 py-[6px] rounded-[2px] text-[#f23f43] hover:bg-[#f23f43] hover:text-white transition-colors text-sm font-medium"
                >
                  <span>删除服务器</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6M10 11v6M14 11v6M9 6V4h6v2"/></svg>
                </button>
              ) : (
                <button
                  onClick={async () => {
                    if (!token || !currentServer) return
                    if (!window.confirm(`确定要退出服务器「${currentServer.name}」吗？`)) return
                    setShowServerMenu(false)
                    try { await leaveGuild(currentServer.id, token); navigate('/') }
                    catch (e: unknown) { alert(e instanceof Error ? e.message : '退出失败') }
                  }}
                  className="w-full flex items-center justify-between px-2 py-[6px] rounded-[2px] text-[#f23f43] hover:bg-[#f23f43] hover:text-white transition-colors text-sm font-medium"
                >
                  <span>退出服务器</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M16 13v-2H7V8l-5 4 5 4v-3z"/><path d="M20 3h-9a2 2 0 00-2 2v4h2V5h9v14h-9v-4H9v4a2 2 0 002 2h9a2 2 0 002-2V5a2 2 0 00-2-2z"/></svg>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Channel list */}
        <div className="flex-1 overflow-y-auto px-2 py-2" style={{ scrollbarWidth: 'thin' }}>
          {/* Text channels category */}
          <div className="mb-1">
            <button className="w-full flex items-center gap-0.5 px-1 py-1 text-[#949ba4] hover:text-[#dbdee1] transition-colors group" onClick={() => setTextCategoryOpen(!textCategoryOpen)}>
              {textCategoryOpen ? <ChevronDown size={12} strokeWidth={3} /> : <ChevronRight size={12} strokeWidth={3} />}
              <span className="text-[11px] font-semibold uppercase tracking-wide ml-0.5 flex-1 text-left">文字频道</span>
              <span className="opacity-0 group-hover:opacity-100 p-0.5 hover:text-white" onClick={(e) => { e.stopPropagation(); setShowAddChannelModal(true) }}><Plus size={14} /></span>
            </button>
            {textCategoryOpen && textChannels.map((channel) => (
              <div
                key={channel.id}
                onClick={() => { setCurrentChannel(channel); if (currentServer) navigate(`/channels/${currentServer.id}/${channel.id}`) }}
                className={`flex items-center gap-1.5 px-2 py-1.5 mx-0 rounded-[4px] cursor-pointer group ${
                  currentChannel?.id === channel.id ? 'bg-[#404249] text-white' : 'text-[#949ba4] hover:bg-[#35373c] hover:text-[#dbdee1]'
                }`}
              >
                <Hash size={18} className="flex-shrink-0" />
                <span className="flex-1 truncate text-[15px]">{channel.name}</span>
                {isOwner && (
                  <button onClick={async (e) => {
                    e.stopPropagation()
                    if (!token) return
                    if (!window.confirm(`确定删除频道「${channel.name}」吗？`)) return
                    try {
                      await deleteChannel(channel.id, token)
                      if (currentChannel?.id === channel.id && currentServer) navigate(`/channels/${currentServer.id}`)
                    } catch (err: unknown) { alert(err instanceof Error ? err.message : '删除失败') }
                  }} className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-[#f23f43] hover:text-white text-[#8e9297] transition-all ml-auto">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Voice channels category */}
          <div className="mb-1">
            <button className="w-full flex items-center gap-0.5 px-1 py-1 text-[#949ba4] hover:text-[#dbdee1] transition-colors group" onClick={() => setVoiceCategoryOpen(!voiceCategoryOpen)}>
              {voiceCategoryOpen ? <ChevronDown size={12} strokeWidth={3} /> : <ChevronRight size={12} strokeWidth={3} />}
              <span className="text-[11px] font-semibold uppercase tracking-wide ml-0.5 flex-1 text-left">语音频道</span>
              <span className="opacity-0 group-hover:opacity-100 p-0.5 hover:text-white" onClick={(e) => { e.stopPropagation(); setShowAddChannelModal(true) }}><Plus size={14} /></span>
            </button>
            {voiceCategoryOpen && voiceChannels.map((channel) => (
              <div key={channel.id} onClick={() => setActiveVoiceChannel(channel)}
                className={`flex items-center gap-1.5 px-2 py-1.5 rounded-[4px] cursor-pointer text-[#949ba4] hover:bg-[#35373c] hover:text-[#dbdee1] ${
                  activeVoiceChannel?.id === channel.id ? 'bg-[#404249] text-white' : ''
                }`}
              >
                <Volume2 size={18} className="flex-shrink-0" />
                <span className="flex-1 truncate text-[15px]">{channel.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── User Panel (bottom) ── */}
        <div className="bg-[#232428] px-2 py-[6px] flex items-center gap-1 h-[52px] flex-shrink-0">
          {/* Avatar + status dot */}
          <Tooltip label={user?.username || 'User'} side="top">
            <div className="relative cursor-pointer flex-shrink-0 rounded p-1 hover:bg-[#35373c] transition-colors">
              <div className="w-8 h-8 bg-[#5865f2] rounded-full flex items-center justify-center text-white text-sm font-bold select-none">
                {user?.username?.[0]?.toUpperCase() || 'U'}
              </div>
              <div
                className="absolute bottom-0.5 right-0.5 w-3 h-3 rounded-full border-2 border-[#232428]"
                style={{ backgroundColor: isMuted ? '#f0b232' : isDeafened ? '#ed4245' : '#23a55a' }}
              />
            </div>
          </Tooltip>

          {/* Username + discriminator */}
          <div className="flex-1 min-w-0 px-1">
            <div className="text-[#f2f3f5] text-[13px] font-semibold truncate leading-[18px] select-none">{user?.username || 'User'}</div>
            <div className="text-[#87898c] text-[11px] truncate leading-[14px] select-none">
              {isMuted ? '已静音' : isDeafened ? '已关闭耳机' : '在线'}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-[2px] flex-shrink-0">
            <Tooltip label={isMuted ? '取消静音' : '静音'} side="top">
              <button
                onClick={() => setIsMuted(!isMuted)}
                className={`w-8 h-8 flex items-center justify-center rounded transition-colors ${
                  isMuted ? 'text-[#f23f43] hover:bg-[#f23f43]/20' : 'text-[#87898c] hover:text-[#dbdee1] hover:bg-[#35373c]'
                }`}
              >
                {isMuted ? <MicOff size={18} /> : <Mic size={18} />}
              </button>
            </Tooltip>
            <Tooltip label={isDeafened ? '取消耳机静音' : '耳机静音'} side="top">
              <button
                onClick={() => setIsDeafened(!isDeafened)}
                className={`w-8 h-8 flex items-center justify-center rounded transition-colors ${
                  isDeafened ? 'text-[#f23f43] hover:bg-[#f23f43]/20' : 'text-[#87898c] hover:text-[#dbdee1] hover:bg-[#35373c]'
                }`}
              >
                <Headphones size={18} />
              </button>
            </Tooltip>
            <Tooltip label="用户设置" side="top">
              <button
                onClick={() => setShowUserSettings(true)}
                className="w-8 h-8 flex items-center justify-center rounded text-[#87898c] hover:text-[#dbdee1] hover:bg-[#35373c] transition-colors"
              >
                <Settings size={18} />
              </button>
            </Tooltip>
          </div>
        </div>
      </div>

      {/* ── Main Chat Area ── */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#313338]">
        {activeVoiceChannel && currentServer && (
          <VoiceChannelPanel channelId={activeVoiceChannel.id} channelName={activeVoiceChannel.name} guildId={currentServer.id} onLeave={() => setActiveVoiceChannel(null)} />
        )}

        {/* Top toolbar */}
        <div className="h-12 px-3 flex items-center gap-2 border-b border-[#26272b] shadow-sm bg-[#313338] flex-shrink-0">
          <div className="flex items-center gap-1.5 mr-2">
            {currentChannel?.type === 'voice'
              ? <Volume2 size={20} className="text-[#80848e]" />
              : <Hash size={20} className="text-[#80848e]" />
            }
            <span className="text-white font-semibold text-[15px]">{currentChannel?.name || 'general'}</span>
          </div>
          <div className="w-px h-6 bg-[#3f4147] mx-1" />
          <span className="text-[#949ba4] text-sm truncate hidden md:block">欢迎使用 {currentServer?.name || 'Discord'}</span>
          <div className="flex-1" />
          <div className="flex items-center gap-1 text-[#b5bac1]">
            <Tooltip label="语音通话" side="top">
              <button className="p-1.5 rounded hover:bg-[#35373c] hover:text-white transition-colors">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1-9.4 0-17-7.6-17-17 0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z"/></svg>
              </button>
            </Tooltip>
            <Tooltip label="视频通话" side="top">
              <button className="p-1.5 rounded hover:bg-[#35373c] hover:text-white transition-colors">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/></svg>
              </button>
            </Tooltip>
            <Tooltip label="固定消息" side="top">
              <button className="p-1.5 rounded hover:bg-[#35373c] hover:text-white transition-colors"><Pin size={20} /></button>
            </Tooltip>
            <Tooltip label={showMembers ? '隐藏成员列表' : '显示成员列表'} side="top">
              <button className={`p-1.5 rounded hover:bg-[#35373c] transition-colors ${showMembers ? 'text-white' : ''}`} onClick={() => setShowMembers(!showMembers)}><Users size={20} /></button>
            </Tooltip>
            <div className="relative ml-1">
              <Search size={16} className="absolute left-2 top-1/2 -translate-y-1/2 text-[#87898c] pointer-events-none" />
              <input type="text" placeholder="搜索" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-[#1e1f22] text-sm text-white pl-7 pr-2 py-1 rounded w-32 outline-none placeholder-[#87898c] focus:w-44 transition-all"
              />
            </div>
            <Tooltip label="收件箱" side="top">
              <button className="p-1.5 rounded hover:bg-[#35373c] hover:text-white transition-colors"><Inbox size={20} /></button>
            </Tooltip>
            <Tooltip label="帮助" side="top">
              <button className="p-1.5 rounded hover:bg-[#35373c] hover:text-white transition-colors">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z"/></svg>
              </button>
            </Tooltip>
          </div>
        </div>

        {/* Messages area */}
        <div ref={messagesContainerRef} className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'thin', scrollbarColor: '#1e1f22 transparent' }}>
          <ChannelWelcomeHeader channel={currentChannel} serverName={currentServer?.name} />
          <div className="px-0 pb-4">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-[#949ba4]"><p className="text-sm">还没有消息，开始聊天吧！</p></div>
            ) : (
              <>
                <LoadMoreMessages onLoadMore={handleLoadMoreMessages} hasMore={hasMoreMessages} isLoading={isLoadingMore} />
                {messages.map((message) => (<MessageItem key={message.id} message={message} />))}
              </>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Message input */}
        <div className="p-4 flex-shrink-0">
          <div className="bg-[#383a40] rounded-lg mx-4 mb-6 flex flex-col">
            <div className="flex items-center px-4 py-2.5 gap-3">
              <Tooltip label="上传文件" side="top">
                <button onClick={handleFileUpload} className="w-6 h-6 flex-shrink-0 flex items-center justify-center text-[#87898c] hover:text-[#dbdee1] transition-colors">
                  <Plus size={22} strokeWidth={2.5} />
                </button>
              </Tooltip>
              <input
                type="text"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder={`发消息给 #${currentChannel?.name || 'general'}`}
                className="flex-1 bg-transparent text-[#dbdee1] outline-none placeholder-[#87898c] text-[15px] leading-[1.375]"
              />
              <div className="flex items-center gap-1 text-[#87898c]">
                <div className="relative">
                  <Tooltip label="送出礼物" side="top">
                    <button className="p-1.5 hover:text-[#dbdee1] transition-colors" onClick={() => { setShowGiftPicker(!showGiftPicker); setShowEmojiPicker(false); setShowGifPicker(false); setShowStickerPicker(false) }}>
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M16.886 7.999H20c1.104 0 2-.896 2-2s-.896-2-2-2h-2.026a3.015 3.015 0 00-.87-1.411A3.015 3.015 0 0015 1.999a3 3 0 00-3 3v1h-1v-1a3 3 0 00-3-3 3.015 3.015 0 00-2.104.588 3.015 3.015 0 00-.87 1.411H3c-1.104 0-2 .896-2 2s.896 2 2 2h3.114A3.99 3.99 0 005 9.999v8c0 1.104.896 2 2 2h10c1.104 0 2-.896 2-2v-8a3.99 3.99 0 00-1.114-2zM15 4.999a1.001 1.001 0 011.707-.707c.188.188.293.442.293.707v1h-2v-1zm-6 0c0-.265.105-.519.293-.707A1.001 1.001 0 0111 4.999v1H9v-1zm8 13H7v-8h10v8z"/></svg>
                    </button>
                  </Tooltip>
                  {showGiftPicker && <GiftPicker onSelect={handleSendGift} onClose={() => setShowGiftPicker(false)} />}
                </div>
                <div className="relative">
                  <Tooltip label="GIF" side="top">
                    <button className="p-1.5 hover:text-[#dbdee1] transition-colors" onClick={() => { setShowGifPicker(!showGifPicker); setShowEmojiPicker(false); setShowStickerPicker(false); setShowGiftPicker(false) }}>
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M2 2h20v20H2V2zm2 2v16h16V4H4zm4 4h2v2H8V8zm0 4h2v2H8v-2zm4-4h2v6h-2V8zm4 0h2v2h-2V8z"/></svg>
                    </button>
                  </Tooltip>
                  {showGifPicker && <GifPicker onSelect={handleAddGif} onClose={() => setShowGifPicker(false)} />}
                </div>
                <div className="relative">
                  <Tooltip label="贴纸" side="top">
                    <button className="p-1.5 hover:text-[#dbdee1] transition-colors" onClick={() => { setShowStickerPicker(!showStickerPicker); setShowEmojiPicker(false); setShowGifPicker(false); setShowGiftPicker(false) }}>
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10"/><circle cx="8.5" cy="10" r="1.5" fill="#383a40"/><circle cx="15.5" cy="10" r="1.5" fill="#383a40"/><path d="M8 14s1.5 2 4 2 4-2 4-2" stroke="#383a40" strokeWidth="1.5" fill="none" strokeLinecap="round"/></svg>
                    </button>
                  </Tooltip>
                  {showStickerPicker && <StickerPicker onSelect={handleAddSticker} onClose={() => setShowStickerPicker(false)} />}
                </div>
                <div className="relative">
                  <Tooltip label="表情" side="top">
                    <button className="p-1.5 hover:text-[#dbdee1] transition-colors" onClick={() => { setShowEmojiPicker(!showEmojiPicker); setShowGifPicker(false); setShowStickerPicker(false); setShowGiftPicker(false) }}>
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2"/><circle cx="8.5" cy="10" r="1.5"/><circle cx="15.5" cy="10" r="1.5"/><path d="M8 14s1.5 2 4 2 4-2 4-2" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round"/></svg>
                    </button>
                  </Tooltip>
                  {showEmojiPicker && <EmojiPicker onSelect={handleAddEmoji} onClose={() => setShowEmojiPicker(false)} />}
                </div>
                <VoiceMessageRecorder onSend={handleVoiceMessageSend} isLoading={isUploadingVoice} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Members Sidebar ── */}
      {showMembers && (
        <div className="w-60 bg-[#2b2d31] flex flex-col flex-shrink-0 overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
          <div className="px-3 pt-4">
            {members.filter(m => m.status !== 'offline').length > 0 && (
              <h3 className="text-[11px] font-semibold text-[#949ba4] uppercase tracking-wide mb-2">
                在线 — {members.filter(m => m.status !== 'offline').length}
              </h3>
            )}
            {members.filter(m => m.status !== 'offline').map((member) => (
              <div key={member.id} className="flex items-center gap-2.5 px-2 py-1.5 rounded-[4px] hover:bg-[#35373c] cursor-pointer mb-0.5">
                <div className="relative flex-shrink-0">
                  <div className="w-8 h-8 bg-[#5865f2] rounded-full flex items-center justify-center text-white text-sm font-semibold">{member.username[0].toUpperCase()}</div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-[#2b2d31]" style={{ backgroundColor: member.status === 'online' ? '#23a55a' : member.status === 'idle' ? '#f0b232' : '#f23f43' }} />
                </div>
                <div className="min-w-0">
                  <div className="text-[#f2f3f5] text-sm font-medium truncate">{member.username}</div>
                  {member.role === 'admin' && <div className="text-[#ea596e] text-[11px]">管理员</div>}
                </div>
              </div>
            ))}
            {members.filter(m => m.status === 'offline').length > 0 && (
              <>
                <h3 className="text-[11px] font-semibold text-[#949ba4] uppercase tracking-wide mb-2 mt-4">
                  离线 — {members.filter(m => m.status === 'offline').length}
                </h3>
                {members.filter(m => m.status === 'offline').map((member) => (
                  <div key={member.id} className="flex items-center gap-2.5 px-2 py-1.5 rounded-[4px] hover:bg-[#35373c] cursor-pointer mb-0.5 opacity-40">
                    <div className="relative flex-shrink-0">
                      <div className="w-8 h-8 bg-[#4e5058] rounded-full flex items-center justify-center text-white text-sm font-semibold">{member.username[0].toUpperCase()}</div>
                      <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-[#80848e] rounded-full border-2 border-[#2b2d31]" />
                    </div>
                    <div className="text-[#949ba4] text-sm truncate">{member.username}</div>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      )}

      {/* ── Modals ── */}
      <Modal isOpen={showAddChannelModal} onClose={() => setShowAddChannelModal(false)} title="创建频道">
        <AddChannelModal guildId={currentServer?.id ?? ''} onClose={() => setShowAddChannelModal(false)} />
      </Modal>

      <Modal isOpen={showAddServerModal} onClose={() => setShowAddServerModal(false)} title="添加服务器">
        <div className="p-4">
          <p className="text-[#b5bac1] mb-4">你想加入一个已有服务器，还是创建一个全新的？</p>
          <div className="space-y-3">
            <button onClick={() => { setShowAddServerModal(false); setShowCreateServerModal(true) }} className="w-full p-3 bg-[#5865f2] hover:bg-[#4752c4] text-white rounded-lg transition-colors flex items-center gap-3">
              <Plus size={20} /><span>创建服务器</span>
            </button>
            <button onClick={() => { setShowAddServerModal(false); setShowJoinServerModal(true) }} className="w-full p-3 bg-[#4e5058] hover:bg-[#3f4147] text-white rounded-lg transition-colors flex items-center gap-3">
              <Compass size={20} /><span>加入服务器</span>
            </button>
          </div>
        </div>
      </Modal>

      {showCreateServerModal && (
        <CreateServerModal onClose={() => setShowCreateServerModal(false)} onCreated={(server) => { setShowCreateServerModal(false); if (token) fetchChannels(server.id, token) }} />
      )}
      {showJoinServerModal && (
        <JoinServerModal onClose={() => setShowJoinServerModal(false)} onJoined={(serverId) => { setShowJoinServerModal(false); if (token) fetchChannels(serverId, token) }} />
      )}
      {showInviteModal && currentServer && (
        <InviteModal guildId={currentServer.id} guildName={currentServer.name} onClose={() => setShowInviteModal(false)} />
      )}
      {showUserSettings && <UserSettingsModal onClose={() => setShowUserSettings(false)} />}
      <DownloadAppModal isOpen={showDownloadModal} onClose={() => setShowDownloadModal(false)} />
    </div>
  )
}
