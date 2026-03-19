import { useState, useEffect, useRef } from 'react'
import { Hash, Volume2, Headphones, Plus, Settings, Crown, Users, Compass, Pin, Download } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useUserStore } from '../shared/stores/userStore'
import { useServerStore } from '../shared/stores/serverStore'
import { type Server, type Channel } from '../shared/types'
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
import { useSocket } from '../hooks/useSocket'

export function HomePage() {
  const user = useUserStore((state) => state.user)
  const token = useUserStore((state) => state.token)
  const logout = useUserStore((state) => state.logout)
  const navigate = useNavigate()
  
  const { 
    servers,
    currentServer, 
    channels, 
    currentChannel, 
    messages, 
    members,
    isLoadingMore,
    hasMoreMessages,
    fetchGuilds,
    fetchChannels,
    fetchMessages,
    loadMoreMessages,
    setCurrentServer,
    setCurrentChannel
  } = useServerStore()
  
  const [messageInput, setMessageInput] = useState('')
  const [showMembers, setShowMembers] = useState(true)
  const [showAddChannelModal, setShowAddChannelModal] = useState(false)
  const [showDownloadModal, setShowDownloadModal] = useState(false)
  const [showAddServerModal, setShowAddServerModal] = useState(false)
  const [activeVoiceChannel, setActiveVoiceChannel] = useState<Channel | null>(null)
  const [isUploadingVoice, setIsUploadingVoice] = useState(false)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [showGifPicker, setShowGifPicker] = useState(false)
  const [showStickerPicker, setShowStickerPicker] = useState(false)
  const [showGiftPicker, setShowGiftPicker] = useState(false)
  const [previousMessageCount, setPreviousMessageCount] = useState(0)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)

  const { sendMessage: sendSocketMessage } = useSocket()

  useEffect(() => {
    if (user?.id && token) {
      fetchGuilds(token)
    }
  }, [user?.id, token])

  useEffect(() => {
    if (currentChannel && token) {
      fetchMessages(currentChannel.id, token)
      setPreviousMessageCount(0) // 重置计数
    }
  }, [currentChannel?.id, token])

  useEffect(() => {
    // 只在新消息到达时自动滚动（消息数量增加且增加的是在末尾）
    // 如果是加载历史消息（消息添加在开头），则不滚动
    if (messages.length > previousMessageCount) {
      const isNewMessage = messages.length - previousMessageCount === 1
      if (isNewMessage) {
        // 新消息到达，滚动到底部
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
      }
      setPreviousMessageCount(messages.length)
    }
  }, [messages, previousMessageCount])

  const handleServerClick = (server: Server) => {
    setCurrentServer(server)
    if (token) {
      fetchChannels(server.id, token)
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const handleSendMessage = () => {
    if (messageInput.trim() && user) {
      sendSocketMessage(messageInput)
      setMessageInput('')
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleFileUpload = async () => {
    if (!currentChannel || !token) {
      alert('请先选择一个频道')
      return
    }

    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*,video/*,.pdf,.doc,.docx'
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return

      console.log('开始上传文件:', file.name, file.type, file.size)

      try {
        const formData = new FormData()
        formData.append('channel_id', currentChannel.id)

        // 判断是否为图片
        const isImage = file.type.startsWith('image/')
        if (isImage) {
          formData.append('image', file)
        } else {
          formData.append('file', file)
        }
        
        const endpoint = isImage ? '/api/files/image' : '/api/files/upload'
        
        console.log('上传到:', endpoint)
        
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          body: formData,
        })

        console.log('响应状态:', response.status)

        if (response.ok) {
          const data = await response.json()
          console.log('文件上传成功:', data)
          alert(`文件上传成功: ${file.name}`)
          // 刷新消息列表
          fetchMessages(currentChannel.id, token)
        } else {
          const error = await response.text()
          console.error('上传失败:', error)
          alert(`文件上传失败: ${error}`)
        }
      } catch (err) {
        console.error('文件上传错误:', err)
        alert(`文件上传失败: ${err}`)
      }
    }
    input.click()
  }

  const handleAddEmoji = (emoji: string) => {
    setMessageInput(prev => prev + emoji)
  }

  const handleAddGif = async (gifUrl: string) => {
    if (!currentChannel || !token) {
      alert('请先选择一个频道')
      return
    }
    
    console.log('发送 GIF:', gifUrl)
    
    try {
      const response = await fetch('/api/files/gif', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          channel_id: currentChannel.id,
          gif_url: gifUrl,
          title: 'GIF',
        }),
      })

      console.log('GIF 响应状态:', response.status)

      if (response.ok) {
        const data = await response.json()
        console.log('GIF 发送成功:', data)
        // 刷新消息列表
        fetchMessages(currentChannel.id, token)
      } else {
        const error = await response.text()
        console.error('GIF 发送失败:', error)
        alert(`GIF 发送失败: ${error}`)
      }
    } catch (err) {
      console.error('GIF 发送错误:', err)
      alert(`GIF 发送失败: ${err}`)
    }
  }

  const handleAddSticker = async (sticker: string) => {
    if (!currentChannel || !token) {
      alert('请先选择一个频道')
      return
    }
    
    console.log('发送贴纸:', sticker)
    
    try {
      const response = await fetch('/api/files/sticker', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          channel_id: currentChannel.id,
          sticker: sticker,
        }),
      })

      console.log('贴纸响应状态:', response.status)

      if (response.ok) {
        const data = await response.json()
        console.log('贴纸发送成功:', data)
        // 刷新消息列表
        fetchMessages(currentChannel.id, token)
      } else {
        const error = await response.text()
        console.error('贴纸发送失败:', error)
        alert(`贴纸发送失败: ${error}`)
      }
    } catch (err) {
      console.error('贴纸发送错误:', err)
      alert(`贴纸发送失败: ${err}`)
    }
  }

  const handleSendGift = async (gift: Gift) => {
    if (!currentChannel || !token) {
      alert('请先选择一个频道')
      return
    }
    
    console.log('发送礼物:', gift)
    
    try {
      const response = await fetch('/api/gifts/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          channel_id: currentChannel.id,
          gift_id: gift.id,
          gift_name: gift.name,
          gift_emoji: gift.emoji,
          gift_price: gift.price,
        }),
      })

      console.log('礼物响应状态:', response.status)

      if (response.ok) {
        const data = await response.json()
        console.log('礼物发送成功:', data)
        // 刷新消息列表
        fetchMessages(currentChannel.id, token)
      } else {
        const error = await response.text()
        console.error('礼物发送失败:', error)
        alert(`礼物发送失败: ${error}`)
      }
    } catch (err) {
      console.error('礼物发送错误:', err)
      alert(`礼物发送失败: ${err}`)
    }
  }

  const handleLoadMoreMessages = async () => {
    if (!currentChannel || !token || !messagesContainerRef.current) return
    
    // 记录加载前的滚动高度
    const container = messagesContainerRef.current
    const scrollHeightBefore = container.scrollHeight
    const scrollTopBefore = container.scrollTop
    
    await loadMoreMessages(currentChannel.id, token)
    
    // 加载后，调整滚动位置以保持当前视图
    // 使用 requestAnimationFrame 确保 DOM 已更新
    requestAnimationFrame(() => {
      const scrollHeightAfter = container.scrollHeight
      const heightDifference = scrollHeightAfter - scrollHeightBefore
      container.scrollTop = scrollTopBefore + heightDifference
    })
  }

  const handleVoiceMessageSend = async (blob: Blob, duration: number) => {
    if (!currentChannel || !token) {
      alert('请先选择一个频道')
      return
    }

    console.log('准备发送语音消息:', {
      size: blob.size,
      type: blob.type,
      duration: duration,
      channelId: currentChannel.id
    })

    try {
      setIsUploadingVoice(true)
      const formData = new FormData()
      formData.append('voice', blob, 'voice-message.webm')
      formData.append('channel_id', currentChannel.id)
      formData.append('duration', duration.toString())

      console.log('发送请求到 /api/voice/message')

      const response = await fetch('/api/voice/message', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      })

      console.log('响应状态:', response.status)

      if (response.ok) {
        const message = await response.json()
        console.log('语音消息发送成功:', message)
        // 刷新消息列表
        if (token) {
          await fetchMessages(currentChannel.id, token)
        }
      } else {
        const errorText = await response.text()
        console.error('语音消息发送失败:', errorText)
        alert(`语音消息发送失败: ${errorText}`)
      }
    } catch (err) {
      console.error('语音消息发送错误:', err)
      alert(`语音消息发送失败: ${err}`)
    } finally {
      setIsUploadingVoice(false)
    }
  }

  const textChannels = channels.filter(c => c.type === 'text')
  const voiceChannels = channels.filter(c => c.type === 'voice')
  const onlineMembers = members.filter(m => m.status === 'online')

  const displayServers = servers.length > 0 ? servers : []

  return (
    <div className="flex h-screen bg-[#313338]">
      {/* Server Sidebar (Leftmost) */}
      <div className="w-[72px] bg-[#202225] flex flex-col items-center py-2 gap-2">
        {/* User Avatar (Top) */}
        <div className="w-12 h-12 bg-[#36393f] rounded-full flex items-center justify-center cursor-pointer hover:rounded-[16px] hover:bg-[#40444b] transition-all">
          <span className="text-2xl">🐼</span>
        </div>

        {/* Server List */}
        <div className="flex-1 w-full overflow-y-auto py-1">
          {displayServers.map((server) => (
            <div 
              key={server.id} 
              className="flex items-center justify-center py-1 relative group"
            >
              <div 
                className={`absolute left-0 w-1 bg-white rounded-r-full transition-all duration-200 ${
                  currentServer?.id === server.id ? 'h-10' : 'h-2 group-hover:h-6'
                }`}
              />
              <div
                onClick={() => handleServerClick(server)}
                className={`relative w-12 h-12 rounded-full flex items-center justify-center text-white font-medium cursor-pointer hover:rounded-[16px] transition-all ${
                  currentServer?.id === server.id ? 'rounded-[16px]' : ''
                }`}
                style={{ 
                  backgroundColor: currentServer?.id === server.id ? server.color : '#36393f',
                  boxShadow: currentServer?.id === server.id ? `0 0 0 2px ${server.color}` : 'none'
                }}
                title={server.name}
              >
                <span className="text-2xl">{server.icon || '📁'}</span>
              </div>
            </div>
          ))}
          
          {/* Separator */}
          <div className="h-6 flex items-center justify-center">
            <div className="w-1 h-6 bg-[#36393f] rounded-full" />
          </div>

          {/* Add Server */}
          <div className="flex items-center justify-center py-1">
            <div 
              onClick={() => setShowAddServerModal(true)}
              className="w-12 h-12 bg-[#36393f] rounded-full flex items-center justify-center text-[#23a559] cursor-pointer hover:rounded-[16px] hover:bg-[#23a559] hover:text-white transition-all"
            >
              <Plus size={20} />
            </div>
          </div>

          {/* Discover */}
          <div className="flex items-center justify-center py-1">
            <div 
              className="w-12 h-12 bg-[#36393f] rounded-full flex items-center justify-center text-[#8e9297] cursor-pointer hover:rounded-[16px] hover:bg-[#5865f2] hover:text-white transition-all"
            >
              <Compass size={20} />
            </div>
          </div>

          {/* Download App */}
          <div className="flex items-center justify-center py-1">
            <div 
              onClick={() => setShowDownloadModal(true)}
              className="w-12 h-12 bg-[#36393f] rounded-full flex items-center justify-center text-[#8e9297] cursor-pointer hover:rounded-[16px] hover:bg-[#40444b] hover:text-white transition-all"
            >
              <Download size={20} />
            </div>
          </div>
        </div>
      </div>

      {/* Channel Sidebar */}
      <div className="w-60 bg-[#2f3136] flex flex-col">
        <div className="h-12 px-4 flex items-center justify-between border-b border-[#202225] shadow-sm cursor-pointer hover:bg-[#36393f] transition-colors">
          <h2 className="text-white font-semibold truncate">{currentServer?.name || 'Discord'}</h2>
          <span className="text-[#8e9297]">▼</span>
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          <div className="mb-4">
            <div className="flex items-center justify-between px-2 py-1 text-[#8e9297] hover:text-white cursor-pointer">
              <div className="flex items-center gap-1 text-xs font-semibold uppercase">
                <span className="text-[10px]">▼</span>
                <span>文字频道</span>
              </div>
              <Plus size={16} className="cursor-pointer hover:text-white" onClick={() => setShowAddChannelModal(true)} />
            </div>
            
            {textChannels.map((channel) => (
              <div
                key={channel.id}
                onClick={() => setCurrentChannel(channel)}
                className={`flex items-center gap-2 px-2 py-1.5 mx-1 rounded cursor-pointer group ${
                  currentChannel?.id === channel.id ? 'bg-[#36393f] text-white' : 'hover:bg-[#36393f]'
                }`}
              >
                <Hash size={20} className={currentChannel?.id === channel.id ? 'text-white' : 'text-[#6b7280]'} />
                <span className={currentChannel?.id === channel.id ? 'text-white' : 'text-[#8e9297] group-hover:text-white'}>
                  {channel.name}
                </span>
              </div>
            ))}
          </div>

          <div className="mb-4">
            <div className="flex items-center justify-between px-2 py-1 text-[#8e9297] hover:text-white cursor-pointer">
              <div className="flex items-center gap-1 text-xs font-semibold uppercase">
                <span className="text-[10px]">▼</span>
                <span>语音频道</span>
              </div>
              <Plus size={16} className="cursor-pointer hover:text-white" onClick={() => setShowAddChannelModal(true)} />
            </div>
            
            {voiceChannels.map((channel) => (
              <div
                key={channel.id}
                onClick={() => setActiveVoiceChannel(channel)}
                className="flex items-center gap-2 px-2 py-1.5 mx-1 rounded hover:bg-[#36393f] cursor-pointer group"
              >
                <Volume2 size={20} className="text-[#6b7280]" />
                <span className="text-[#8e9297] group-hover:text-white">{channel.name}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[#292b2f] p-2">
          <div className="flex items-center gap-2 p-2 rounded hover:bg-[#36393f] cursor-pointer">
            <div className="w-8 h-8 bg-[#5865f2] rounded-full flex items-center justify-center text-white text-sm font-semibold relative">
              {user?.username?.[0]?.toUpperCase() || 'U'}
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-[#292b2f]" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-white text-sm font-medium truncate">{user?.username || 'User'}</div>
              <div className="text-[#8e9297] text-xs">#{user?.discriminator || '0000'}</div>
            </div>
            <div className="flex items-center gap-1">
              <Headphones size={18} className="text-[#8e9297] hover:text-white cursor-pointer" />
              <Settings size={18} className="text-[#8e9297] hover:text-white cursor-pointer" onClick={handleLogout} />
            </div>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#313338]">
        {activeVoiceChannel && currentServer && (
          <VoiceChannelPanel
            channelId={activeVoiceChannel.id}
            channelName={activeVoiceChannel.name}
            guildId={currentServer.id}
            onLeave={() => setActiveVoiceChannel(null)}
          />
        )}

        <div className="h-12 px-4 flex items-center gap-2 border-b border-[#26272b] shadow-sm bg-[#313338]">
          {currentChannel?.type === 'text' ? (
            <Hash size={24} className="text-[#80848e]" />
          ) : (
            <Volume2 size={24} className="text-[#80848e]" />
          )}
          <span className="text-white font-semibold">{currentChannel?.name || 'general'}</span>
          <div className="flex-1" />
          <div className="flex items-center gap-4 text-[#b5bac1]">
            <button className="hover:text-white transition-colors" title="通知设置">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M21.178 12.85l-1.63-1.63c.133-.353.21-.732.21-1.13V8.36c0-2.335-1.615-4.308-3.78-4.857-.318-1.272-1.447-2.22-2.798-2.22s-2.48.948-2.798 2.22c-2.165.549-3.78 2.522-3.78 4.857v1.73c0 .398.077.777.21 1.13l-1.63 1.63c-.387.387-.387 1.015 0 1.402l.707.707c.387.387 1.015.387 1.402 0l1.63-1.63c.353.133.732.21 1.13.21h1.73c2.335 0 4.308-1.615 4.857-3.78 1.272-.318 2.22-1.447 2.22-2.798s-.948-2.48-2.22-2.798c-.549-2.165-2.522-3.78-4.857-3.78h-1.73c-.398 0-.777.077-1.13.21l-1.63-1.63c-.387-.387-1.015-.387-1.402 0l-.707.707c-.387.387-.387 1.015 0 1.402l1.63 1.63c-.133.353-.21.732-.21 1.13v1.73c0 2.335 1.615 4.308 3.78 4.857.318 1.272 1.447 2.22 2.798 2.22s2.48-.948 2.798-2.22c2.165-.549 3.78-2.522 3.78-4.857v-1.73c0-.398-.077-.777-.21-1.13l1.63-1.63c.387-.387.387-1.015 0-1.402l-.707-.707c-.387-.387-1.015-.387-1.402 0z"/>
              </svg>
            </button>
            <button className="hover:text-white transition-colors" title="固定消息">
              <Pin size={24} />
            </button>
            <button className="hover:text-white transition-colors" onClick={() => setShowMembers(!showMembers)} title="成员列表">
              <Users size={24} />
            </button>
            <div className="relative">
              <input
                type="text"
                placeholder="搜索"
                className="bg-[#1e1f22] text-sm text-white px-2 py-1.5 rounded w-36 outline-none placeholder-[#80848e]"
              />
            </div>
          </div>
        </div>

        {/* 频道标题 - 固定在顶部 */}
        <div className="px-4 pt-4 pb-2 bg-[#313338] border-b border-[#26272b]">
          <div className="flex items-start gap-3">
            <div className="w-16 h-16 bg-[#43444b] rounded-full flex items-center justify-center flex-shrink-0">
              <Hash size={40} className="text-[#b5bac1]" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-[32px] font-bold text-white mb-1">
                欢迎来到 #{currentChannel?.name || 'general'}!
              </h1>
              <p className="text-[#b5bac1] text-base">
                这是 #{currentChannel?.name || 'general'} 频道的起点。
              </p>
            </div>
          </div>
        </div>

        {/* 消息滚动区域 */}
        <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-[#949ba4]">
              <p className="text-sm">还没有消息，开始聊天吧！</p>
            </div>
          ) : (
            <>
              <LoadMoreMessages
                onLoadMore={handleLoadMoreMessages}
                hasMore={hasMoreMessages}
                isLoading={isLoadingMore}
              />

              {messages.map((message) => (
                <MessageItem key={message.id} message={message} />
              ))}
            </>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4">
          <div className="bg-[#383a40] rounded-lg px-4 py-3 flex items-center gap-3">
            <button 
              onClick={handleFileUpload}
              className="text-[#b5bac1] hover:text-white transition-colors"
              title="上传文件"
            >
              <Plus size={24} />
            </button>
            <input
              type="text"
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder={`发送消息到 #${currentChannel?.name || 'general'}`}
              className="flex-1 bg-transparent text-white outline-none placeholder-[#6d6f78] text-[15px]"
            />
            <div className="flex items-center gap-3 text-[#b5bac1]">
              <div className="relative">
                <button 
                  className="hover:text-white transition-colors" 
                  title="礼物"
                  onClick={() => {
                    setShowGiftPicker(!showGiftPicker)
                    setShowEmojiPicker(false)
                    setShowGifPicker(false)
                    setShowStickerPicker(false)
                  }}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M16.886 7.999H20c1.104 0 2-.896 2-2s-.896-2-2-2h-2.026a3.015 3.015 0 00-.87-1.411A3.015 3.015 0 0015 1.999a3 3 0 00-3 3v1h-1v-1a3 3 0 00-3-3 3.015 3.015 0 00-2.104.588 3.015 3.015 0 00-.87 1.411H3c-1.104 0-2 .896-2 2s.896 2 2 2h3.114A3.99 3.99 0 005 9.999v8c0 1.104.896 2 2 2h10c1.104 0 2-.896 2-2v-8a3.99 3.99 0 00-1.114-2zM15 4.999a1.001 1.001 0 011.707-.707c.188.188.293.442.293.707v1h-2v-1zm-6 0c0-.265.105-.519.293-.707A1.001 1.001 0 0111 4.999v1H9v-1zm8 13H7v-8h10v8z"/>
                  </svg>
                </button>
                {showGiftPicker && (
                  <GiftPicker
                    onSelect={handleSendGift}
                    onClose={() => setShowGiftPicker(false)}
                  />
                )}
              </div>
              <div className="relative">
                <button 
                  className="hover:text-white transition-colors" 
                  title="GIF"
                  onClick={() => {
                    setShowGifPicker(!showGifPicker)
                    setShowEmojiPicker(false)
                    setShowStickerPicker(false)
                  }}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M2 2h20v20H2V2zm2 2v16h16V4H4zm4 4h2v2H8V8zm0 4h2v2H8v-2zm4-4h2v6h-2V8zm4 0h2v2h-2V8z"/>
                  </svg>
                </button>
                {showGifPicker && (
                  <GifPicker
                    onSelect={handleAddGif}
                    onClose={() => setShowGifPicker(false)}
                  />
                )}
              </div>
              <div className="relative">
                <button 
                  className="hover:text-white transition-colors" 
                  title="贴纸"
                  onClick={() => {
                    setShowStickerPicker(!showStickerPicker)
                    setShowEmojiPicker(false)
                    setShowGifPicker(false)
                  }}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <circle cx="12" cy="12" r="10"/>
                    <circle cx="8.5" cy="10" r="1.5" fill="#383a40"/>
                    <circle cx="15.5" cy="10" r="1.5" fill="#383a40"/>
                    <path d="M8 14s1.5 2 4 2 4-2 4-2" stroke="#383a40" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
                  </svg>
                </button>
                {showStickerPicker && (
                  <StickerPicker
                    onSelect={handleAddSticker}
                    onClose={() => setShowStickerPicker(false)}
                  />
                )}
              </div>
              <div className="relative">
                <button 
                  className="hover:text-white transition-colors" 
                  title="表情"
                  onClick={() => {
                    setShowEmojiPicker(!showEmojiPicker)
                    setShowGifPicker(false)
                    setShowStickerPicker(false)
                  }}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2"/>
                    <circle cx="8.5" cy="10" r="1.5"/>
                    <circle cx="15.5" cy="10" r="1.5"/>
                    <path d="M8 14s1.5 2 4 2 4-2 4-2" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
                  </svg>
                </button>
                {showEmojiPicker && (
                  <EmojiPicker
                    onSelect={handleAddEmoji}
                    onClose={() => setShowEmojiPicker(false)}
                  />
                )}
              </div>
              <VoiceMessageRecorder 
                onSend={handleVoiceMessageSend}
                isLoading={isUploadingVoice}
              />
            </div>
          </div>
        </div>
      </div>

      {showMembers && (
        <div className="w-60 bg-[#2f3136] p-4 overflow-y-auto">
          <h3 className="text-xs font-semibold text-[#8e9297] uppercase mb-4">
            在线 — {onlineMembers.length}
          </h3>
          {onlineMembers.map((member) => (
            <div key={member.id} className="flex items-center gap-2 px-2 py-1.5 hover:bg-[#36393f] rounded cursor-pointer mb-1">
              <div className="relative">
                <div className="w-8 h-8 bg-[#5865f2] rounded-full flex items-center justify-center text-white text-sm font-semibold">
                  {member.username[0]}
                </div>
                <div 
                  className="absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-[#2f3136]"
                  style={{ 
                    backgroundColor: 
                      member.status === 'online' ? '#23a55a' : 
                      member.status === 'idle' ? '#f0b232' : 
                      member.status === 'dnd' ? '#f23f43' : '#8e9297'
                  }}
                />
              </div>
              <div className="text-white text-sm font-medium">{member.username}</div>
              {member.role === 'admin' && <div className="text-[#ea596e] text-xs">管理员</div>}
              {member.role === 'moderator' && <div className="text-[#f0b232] text-xs">版主</div>}
            </div>
          ))}

          <h3 className="text-xs font-semibold text-[#8e9297] uppercase mb-4 mt-6">
            离线 — {members.filter(m => m.status === 'offline').length}
          </h3>
          {members.filter(m => m.status === 'offline').map((member) => (
            <div key={member.id} className="flex items-center gap-2 px-2 py-1.5 hover:bg-[#36393f] rounded cursor-pointer mb-1 opacity-50">
              <div className="relative">
                <div className="w-8 h-8 bg-[#5865f2] rounded-full flex items-center justify-center text-white text-sm font-semibold">
                  {member.username[0]}
                </div>
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-[#8e9297] rounded-full border-2 border-[#2f3136]" />
              </div>
              <div className="text-white text-sm font-medium">{member.username}</div>
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      <Modal
        isOpen={showAddChannelModal}
        onClose={() => setShowAddChannelModal(false)}
        title="创建频道"
      >
        <AddChannelModal
          onClose={() => setShowAddChannelModal(false)}
        />
      </Modal>

      <Modal
        isOpen={showAddServerModal}
        onClose={() => setShowAddServerModal(false)}
        title="创建服务器"
      >
        <div className="p-4">
          <p className="text-[#b5bac1] mb-4">通过创建一个新服务器来开始你的新社区。</p>
          <div className="space-y-3">
            <button 
              onClick={() => setShowAddServerModal(false)}
              className="w-full p-3 bg-[#5865f2] hover:bg-[#4752c4] text-white rounded-lg transition-colors flex items-center gap-3"
            >
              <Plus size={20} />
              <span>创建我的服务器</span>
            </button>
            <button 
              onClick={() => setShowAddServerModal(false)}
              className="w-full p-3 bg-[#4e5058] hover:bg-[#3f4147] text-white rounded-lg transition-colors flex items-center gap-3"
            >
              <Compass size={20} />
              <span>加入服务器</span>
            </button>
          </div>
        </div>
      </Modal>

      <DownloadAppModal
        isOpen={showDownloadModal}
        onClose={() => setShowDownloadModal(false)}
      />
    </div>
  )
}
