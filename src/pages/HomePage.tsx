import { useState, useEffect } from 'react'
import { Hash, Volume2, Headphones, Plus, Settings, Crown, Users, Compass, Pin, Download } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useUserStore } from '../shared/stores/userStore'
import { useServerStore } from '../shared/stores/serverStore'
import { type Server, type Channel } from '../mock/data'
import { Modal } from '../components/Modal'
import { AddChannelModal } from '../components/AddChannelModal'
import { DownloadAppModal } from '../components/DownloadAppModal'
import { VoiceChannelPanel } from '../components/VoiceChannelPanel'
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
    fetchGuilds,
    fetchChannels,
    setCurrentServer,
    setCurrentChannel
  } = useServerStore()
  
  const [messageInput, setMessageInput] = useState('')
  const [showMembers, setShowMembers] = useState(true)
  const [showAddChannelModal, setShowAddChannelModal] = useState(false)
  const [showDownloadModal, setShowDownloadModal] = useState(false)
  const [showAddServerModal, setShowAddServerModal] = useState(false)
  const [activeVoiceChannel, setActiveVoiceChannel] = useState<Channel | null>(null)

  const { connect, disconnect, sendMessage: sendSocketMessage } = useSocket()

  useEffect(() => {
    if (user?.id && token) {
      fetchGuilds(token)
      connect()
    }
    return () => {
      disconnect()
    }
  }, [user?.id, token])

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
      <div className="flex-1 flex flex-col min-w-0">
        {activeVoiceChannel && currentServer && (
          <VoiceChannelPanel
            channelId={activeVoiceChannel.id}
            channelName={activeVoiceChannel.name}
            guildId={currentServer.id}
            onLeave={() => setActiveVoiceChannel(null)}
          />
        )}

        <div className="h-12 px-4 flex items-center gap-2 border-b border-[#202225] shadow-sm bg-[#36393f]">
          {currentChannel?.type === 'text' ? (
            <Hash size={24} className="text-[#8e9297]" />
          ) : (
            <Volume2 size={24} className="text-[#8e9297]" />
          )}
          <span className="text-white font-semibold">{currentChannel?.name || 'general'}</span>
          <div className="flex-1" />
          <div className="flex items-center gap-3 text-[#8e9297]">
            <Pin size={20} className="hover:text-white cursor-pointer" />
            <Users size={20} className="hover:text-white cursor-pointer" onClick={() => setShowMembers(!showMembers)} />
            <div className="relative">
              <input
                type="text"
                placeholder="搜索"
                className="bg-[#202225] text-sm text-white px-2 py-1 rounded transition-all w-36 focus:w-60 outline-none placeholder-[#8e9297]"
              />
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <div className="mb-6 mt-2">
            {currentServer?.banner && (
              <div 
                className="w-full h-32 rounded-lg mb-4 bg-cover bg-center"
                style={{ backgroundImage: `url(${currentServer.banner})` }}
              />
            )}
            <div className="w-16 h-16 bg-[#36393f] rounded-full flex items-center justify-center mb-4">
              <Crown size={40} className="text-[#e91e63]" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">欢迎来到 {currentServer?.name || 'Discord'}!</h1>
            <p className="text-[#8e9297]">这是 #{currentChannel?.name || 'general'} 频道的开头</p>
          </div>

          {messages.map((message) => (
            <div key={message.id} className="flex gap-4 mb-4 group hover:bg-[#2f3136] -mx-4 px-4 py-1 rounded">
              <div className="w-10 h-10 bg-[#5865f2] rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0">
                {message.author.username[0].toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-white font-semibold">{message.author.username}</span>
                  <span className="text-[#8e9297] text-xs">
                    {new Date(message.timestamp).toLocaleString('zh-CN', { 
                      month: 'numeric', 
                      day: 'numeric', 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </span>
                </div>
                <p className="text-[#dcddde] mt-0.5 whitespace-pre-wrap">{message.content}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="p-4">
          <div className="bg-[#40444b] rounded-lg px-4 py-2.5 flex items-center gap-2">
            <button className="text-[#8e9297] hover:text-white">
              <Plus size={24} />
            </button>
            <input
              type="text"
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder={`发送消息到 #${currentChannel?.name || 'general'}`}
              className="flex-1 bg-transparent text-white outline-none placeholder-[#8e9297]"
            />
            <div className="flex items-center gap-2 text-[#8e9297]">
              <Compass size={20} className="hover:text-white cursor-pointer" />
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
