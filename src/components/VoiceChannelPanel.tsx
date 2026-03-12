import { useState, useRef, useEffect } from 'react'
import { 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  PhoneOff, 
  MonitorUp, 
  Maximize2,
  Minimize2
} from 'lucide-react'
import { useWebRTC } from '../hooks/useWebRTC'
import { useUserStore } from '../shared/stores/userStore'
import { wsService } from '../services/socketService'
import type { User } from '../mock/data'

interface VoiceChannelPanelProps {
  channelId: string
  channelName: string
  guildId: string
  onLeave: () => void
}

export function VoiceChannelPanel({ channelId, channelName, guildId, onLeave }: VoiceChannelPanelProps) {
  const user = useUserStore((state) => state.user)
  const [isExpanded, setIsExpanded] = useState(false)
  const localVideoRef = useRef<HTMLVideoElement>(null)
  
  const {
    localStream,
    participants,
    isMuted,
    isVideoOff,
    isScreenSharing,
    error,
    joinChannel,
    leaveChannel,
    toggleMute,
    toggleVideo,
    toggleScreenShare,
  } = useWebRTC()

  useEffect(() => {
    if (localStream && localVideoRef.current) {
      localVideoRef.current.srcObject = localStream
    }
  }, [localStream])

  useEffect(() => {
    if (user) {
      joinChannel(channelId, user as User)
      wsService.joinVoiceChannel(channelId, guildId)
    }
    
    return () => {
      wsService.leaveVoiceChannel(guildId)
      leaveChannel()
    }
  }, [channelId, guildId])

  const handleLeave = () => {
    wsService.leaveVoiceChannel(guildId)
    leaveChannel()
    onLeave()
  }

  const allParticipants = [
    ...(localStream ? [{ user: user as User, stream: localStream, isMuted, isVideoOff }] : []),
    ...Array.from(participants.values())
  ]

  if (error) {
    return (
      <div className="bg-[#313338] border-t border-[#1e1f22] p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-[#f23f43] rounded-full animate-pulse" />
            <span className="text-white text-sm font-medium">{channelName}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[#f23f43] text-xs">{error}</span>
            <button
              onClick={onLeave}
              className="p-2 bg-[#f23f43] hover:bg-[#d93639] rounded-md transition-colors"
            >
              <PhoneOff className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-[#313338] border-t border-[#1e1f22] transition-all ${isExpanded ? 'fixed inset-0 z-50' : ''}`}>
      {isExpanded && (
        <div className="absolute top-4 right-4 z-10">
          <button
            onClick={() => setIsExpanded(false)}
            className="p-2 bg-[#2b2d31] hover:bg-[#1e1f22] rounded-md transition-colors"
          >
            <Minimize2 className="w-5 h-5 text-white" />
          </button>
        </div>
      )}

      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-[#23a559] rounded-full animate-pulse" />
            <span className="text-white text-sm font-medium">{channelName}</span>
            <span className="text-[#949ba4] text-xs">({allParticipants.length})</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2 bg-[#2b2d31] hover:bg-[#1e1f22] rounded-md transition-colors"
            >
              {isExpanded ? (
                <Minimize2 className="w-4 h-4 text-white" />
              ) : (
                <Maximize2 className="w-4 h-4 text-white" />
              )}
            </button>
          </div>
        </div>

        {isExpanded && (
          <div className="flex items-center justify-center h-[calc(100vh-120px)]">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-w-6xl w-full overflow-y-auto p-4">
              {allParticipants.map((participant) => (
                <div key={participant.user.id} className="relative aspect-video bg-[#1e1f22] rounded-lg overflow-hidden">
                  {participant.stream && !participant.isVideoOff ? (
                    <video
                      ref={participant.user.id === user?.id ? localVideoRef : null}
                      autoPlay
                      playsInline
                      muted={participant.user.id === user?.id}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      {participant.user.avatar ? (
                        <img 
                          src={participant.user.avatar} 
                          alt={participant.user.username}
                          className="w-16 h-16 rounded-full"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-[#5865f2] flex items-center justify-center text-white text-xl font-bold">
                          {participant.user.username.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                  )}
                  <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
                    <span className="text-white text-xs bg-black/50 px-2 py-1 rounded">
                      {participant.user.username}
                      {participant.user.id === user?.id && ' (你)'}
                    </span>
                    <div className="flex gap-1">
                      {participant.isMuted && (
                        <MicOff className="w-3 h-3 text-[#f23f43]" />
                      )}
                      {participant.isVideoOff && (
                        <VideoOff className="w-3 h-3 text-[#f23f43]" />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center justify-center gap-3 mt-4">
          <button
            onClick={toggleMute}
            className={`p-3 rounded-full transition-colors ${
              isMuted 
                ? 'bg-[#f23f43] hover:bg-[#d93639]' 
                : 'bg-[#2b2d31] hover:bg-[#1e1f22]'
            }`}
            title={isMuted ? '取消静音' : '静音'}
          >
            {isMuted ? (
              <MicOff className="w-5 h-5 text-white" />
            ) : (
              <Mic className="w-5 h-5 text-white" />
            )}
          </button>

          <button
            onClick={toggleVideo}
            className={`p-3 rounded-full transition-colors ${
              isVideoOff 
                ? 'bg-[#f23f43] hover:bg-[#d93639]' 
                : 'bg-[#2b2d31] hover:bg-[#1e1f22]'
            }`}
            title={isVideoOff ? '打开视频' : '关闭视频'}
          >
            {isVideoOff ? (
              <VideoOff className="w-5 h-5 text-white" />
            ) : (
              <Video className="w-5 h-5 text-white" />
            )}
          </button>

          <button
            onClick={toggleScreenShare}
            className={`p-3 rounded-full transition-colors ${
              isScreenSharing 
                ? 'bg-[#23a559] hover:bg-[#1e8233]' 
                : 'bg-[#2b2d31] hover:bg-[#1e1f22]'
            }`}
            title={isScreenSharing ? '停止屏幕共享' : '共享屏幕'}
          >
            <MonitorUp className="w-5 h-5 text-white" />
          </button>

          <button
            onClick={handleLeave}
            className="p-3 bg-[#f23f43] hover:bg-[#d93639] rounded-full transition-colors"
            title="离开语音频道"
          >
            <PhoneOff className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>
    </div>
  )
}
