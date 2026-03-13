import { useState, useRef, useEffect } from 'react'
import { Mic, MicOff, Video, VideoOff, PhoneOff, MonitorUp, Headphones, HeadphoneOff, X } from 'lucide-react'
import { useWebRTC } from '../hooks/useWebRTC'
import { useUserStore } from '../shared/stores/userStore'
import { wsService } from '../services/socketService'
import type { User } from '../shared/types'

interface VoiceChannelPanelProps {
  channelId: string
  channelName: string
  guildId: string
  onLeave: () => void
}

export function VoiceChannelPanel({ channelId, channelName, guildId, onLeave }: VoiceChannelPanelProps) {
  const user = useUserStore((state) => state.user)
  const [isConnected, setIsConnected] = useState(false)
  const [enableAudio, setEnableAudio] = useState(true)
  const [enableVideo, setEnableVideo] = useState(false)
  const [enableSpeaker, setEnableSpeaker] = useState(true)
  const localVideoRef = useRef<HTMLVideoElement>(null)
  
  const { localStream, participants, isMuted, isVideoOff, isScreenSharing, webRTCError, initializeMedia, joinChannel, leaveChannel, toggleMute, toggleVideo, toggleScreenShare } = useWebRTC()

  useEffect(() => {
    if (localStream && localVideoRef.current) {
      localVideoRef.current.srcObject = localStream
    }
  }, [localStream])

  const handleConnect = async () => {
    try {
      await initializeMedia(enableAudio, enableVideo)
      if (user) {
        await joinChannel(channelId, user as User)
        wsService.joinVoiceChannel(channelId, guildId)
        setIsConnected(true)
      }
    } catch (err) {
      console.error('Failed to connect:', err)
    }
  }

  const handleDisconnect = () => {
    wsService.leaveVoiceChannel(guildId)
    leaveChannel()
    setIsConnected(false)
  }

  const handleEndCall = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token || !user) return
      const participantIds = Array.from(participants.values()).map(p => p.user.id)
      participantIds.push(user.id)
      await fetch('/api/voice/end-call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ channel_id: channelId, participants: participantIds, has_video: !isVideoOff }),
      })
    } catch (err) {
      console.error('Failed to end call:', err)
    }
    handleDisconnect()
    onLeave()
  }

  const allParticipants = [...(localStream ? [{ user: user as User, stream: localStream, isMuted, isVideoOff }] : []), ...Array.from(participants.values())]

  if (!isConnected) {
    return (
      <div className="bg-[#313338] border-t border-[#1e1f22] p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-[#949ba4] rounded-full" />
            <span className="text-white text-sm font-semibold">{channelName}</span>
          </div>
          <button onClick={onLeave} className="p-1.5 hover:bg-[#2b2d31] rounded transition-colors">
            <X className="w-4 h-4 text-[#949ba4]" />
          </button>
        </div>
        <div className="bg-[#2b2d31] rounded-lg p-4 space-y-4">
          <div>
            <p className="text-white text-sm font-medium mb-3">连接设置</p>
            <div className="space-y-2">
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={enableAudio} onChange={(e) => setEnableAudio(e.target.checked)} className="w-4 h-4" />
                <Mic className="w-4 h-4 text-[#949ba4]" />
                <span className="text-white text-sm">麦克风</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={enableVideo} onChange={(e) => setEnableVideo(e.target.checked)} className="w-4 h-4" />
                <Video className="w-4 h-4 text-[#949ba4]" />
                <span className="text-white text-sm">摄像头</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={enableSpeaker} onChange={(e) => setEnableSpeaker(e.target.checked)} className="w-4 h-4" />
                <Headphones className="w-4 h-4 text-[#949ba4]" />
                <span className="text-white text-sm">扬声器</span>
              </label>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t border-[#404249]">
            <button onClick={onLeave} className="px-4 py-2 bg-[#404249] hover:bg-[#4f545c] text-white rounded text-sm">取消</button>
            <button onClick={handleConnect} className="px-4 py-2 bg-[#5865f2] hover:bg-[#4752c4] text-white rounded text-sm">连接</button>
          </div>
        </div>
      </div>
    )
  }

  if (webRTCError) {
    return (
      <div className="bg-[#313338] border-t border-[#1e1f22] p-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-[#f23f43] rounded-full animate-pulse" />
          <span className="text-white text-sm">{channelName}</span>
          <span className="text-[#f23f43] text-xs">{webRTCError}</span>
        </div>
        <button onClick={handleEndCall} className="p-2 bg-[#f23f43] hover:bg-[#d93639] rounded">
          <PhoneOff className="w-4 h-4 text-white" />
        </button>
      </div>
    )
  }

  return (
    <div className="bg-[#313338] border-t border-[#1e1f22] flex flex-col h-full">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-[#1e1f22]">
        <div className="w-2 h-2 bg-[#23a559] rounded-full animate-pulse" />
        <span className="text-white text-sm font-semibold">{channelName}</span>
        <span className="text-[#949ba4] text-xs">({allParticipants.length})</span>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {allParticipants.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full">
            <Headphones className="w-8 h-8 text-[#949ba4] mb-3" />
            <p className="text-[#949ba4] text-sm">等待其他人加入...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {allParticipants.map((p) => (
              <div key={p.user.id} className="relative aspect-video bg-[#1e1f22] rounded-lg overflow-hidden group">
                {p.stream && !p.isVideoOff ? (
                  <video ref={p.user.id === user?.id ? localVideoRef : null} autoPlay playsInline muted={p.user.id === user?.id} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#2b2d31] to-[#1e1f22]">
                    <div className="w-12 h-12 bg-[#5865f2] rounded-full flex items-center justify-center mb-2">
                      <span className="text-white font-bold">{p.user.username.charAt(0).toUpperCase()}</span>
                    </div>
                    <span className="text-white text-sm font-medium">{p.user.username}</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                  <span className="text-white text-xs bg-black/40 px-2 py-1 rounded w-fit">{p.user.username}{p.user.id === user?.id && ' (你)'}</span>
                  <div className="flex gap-1 justify-end">
                    {p.isMuted && <div className="bg-[#f23f43] p-1 rounded"><MicOff className="w-3 h-3 text-white" /></div>}
                    {p.isVideoOff && <div className="bg-[#f23f43] p-1 rounded"><VideoOff className="w-3 h-3 text-white" /></div>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="border-t border-[#1e1f22] bg-[#2b2d31] px-4 py-3 flex justify-center gap-2">
        <button onClick={toggleMute} className={`p-3 rounded-full ${isMuted ? 'bg-[#f23f43]' : 'bg-[#404249]'} hover:opacity-80`}>
          {isMuted ? <MicOff className="w-5 h-5 text-white" /> : <Mic className="w-5 h-5 text-white" />}
        </button>
        <button onClick={toggleVideo} className={`p-3 rounded-full ${isVideoOff ? 'bg-[#f23f43]' : 'bg-[#404249]'} hover:opacity-80`}>
          {isVideoOff ? <VideoOff className="w-5 h-5 text-white" /> : <Video className="w-5 h-5 text-white" />}
        </button>
        <button onClick={() => setEnableSpeaker(!enableSpeaker)} className={`p-3 rounded-full ${enableSpeaker ? 'bg-[#404249]' : 'bg-[#f23f43]'} hover:opacity-80`}>
          {enableSpeaker ? <Headphones className="w-5 h-5 text-white" /> : <HeadphoneOff className="w-5 h-5 text-white" />}
        </button>
        <button onClick={toggleScreenShare} className={`p-3 rounded-full ${isScreenSharing ? 'bg-[#23a559]' : 'bg-[#404249]'} hover:opacity-80`}>
          <MonitorUp className="w-5 h-5 text-white" />
        </button>
        <div className="w-px h-6 bg-[#404249]" />
        <button onClick={handleEndCall} className="p-3 bg-[#f23f43] hover:opacity-80 rounded-full">
          <PhoneOff className="w-5 h-5 text-white" />
        </button>
      </div>
    </div>
  )
}
