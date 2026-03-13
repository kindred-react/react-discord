import { useState, useRef, useCallback, useEffect } from 'react'
import type { User } from '../shared/types'

export interface Participant {
  user: User
  stream: MediaStream | null
  isMuted: boolean
  isVideoOff: boolean
  isSpeaking: boolean
}

interface UseWebRTCReturn {
  localStream: MediaStream | null
  participants: Map<string, Participant>
  isInCall: boolean
  isMuted: boolean
  isVideoOff: boolean
  isScreenSharing: boolean
  webRTCError: string | null
  initializeMedia: (enableAudio: boolean, enableVideo: boolean) => Promise<void>
  joinChannel: (channelId: string, user: User) => Promise<void>
  leaveChannel: () => void
  toggleMute: () => void
  toggleVideo: () => void
  toggleScreenShare: () => Promise<void>
}

export function useWebRTC(): UseWebRTCReturn {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null)
  const [participants, setParticipants] = useState<Map<string, Participant>>(new Map())
  const [isInCall, setIsInCall] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [isVideoOff, setIsVideoOff] = useState(false)
  const [isScreenSharing, setIsScreenSharing] = useState(false)
  const [webRTCError, setWebRTCError] = useState<string | null>(null)

  const currentChannelId = useRef<string | null>(null)
  const currentUser = useRef<User | null>(null)
  const screenStream = useRef<MediaStream | null>(null)
  const _peerConnections = useRef<Map<string, RTCPeerConnection>>(new Map())

  const initializeMedia = useCallback(async (enableAudio: boolean, enableVideo: boolean) => {
    try {
      setWebRTCError(null)
      
      if (!enableAudio && !enableVideo) {
        setLocalStream(null)
        return
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: enableAudio,
        video: enableVideo,
      })

      setLocalStream(stream)
      setIsMuted(!enableAudio)
      setIsVideoOff(!enableVideo)
      console.log('Media initialized - Audio:', enableAudio, 'Video:', enableVideo)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to initialize media'
      setWebRTCError(errorMessage)
      console.error('Error initializing media:', err)
    }
  }, [])

  const joinChannel = useCallback(async (channelId: string, user: User) => {
    try {
      setWebRTCError(null)
      currentChannelId.current = channelId
      currentUser.current = user
      setIsInCall(true)
      console.log('Joined voice channel:', channelId, 'as', user.username)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to join voice channel'
      setWebRTCError(errorMessage)
      console.error('Error joining channel:', err)
    }
  }, [])

  const leaveChannel = useCallback(() => {
    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop())
      setLocalStream(null)
    }

    if (screenStream.current) {
      screenStream.current.getTracks().forEach((track) => track.stop())
      screenStream.current = null
    }

    _peerConnections.current.forEach((pc) => pc.close())
    _peerConnections.current.clear()

    setParticipants(new Map())
    setIsInCall(false)
    setIsMuted(false)
    setIsVideoOff(false)
    setIsScreenSharing(false)
    currentChannelId.current = null
    currentUser.current = null
  }, [])

  const toggleMute = useCallback(() => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0]
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled
        setIsMuted(!audioTrack.enabled)
      }
    }
  }, [localStream])

  const toggleVideo = useCallback(() => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0]
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled
        setIsVideoOff(!videoTrack.enabled)
      }
    }
  }, [localStream])

  const toggleScreenShare = useCallback(async () => {
    if (isScreenSharing) {
      if (screenStream.current) {
        screenStream.current.getTracks().forEach((track) => track.stop())
        screenStream.current = null
      }
      setIsScreenSharing(false)
    } else {
      try {
        const stream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true,
        })
        screenStream.current = stream
        setIsScreenSharing(true)

        stream.getVideoTracks()[0].onended = () => {
          setIsScreenSharing(false)
          screenStream.current = null
        }
      } catch (err) {
        console.error('Error sharing screen:', err)
      }
    }
  }, [isScreenSharing])

  useEffect(() => {
    return () => {
      leaveChannel()
    }
  }, [leaveChannel])

  return {
    localStream,
    participants,
    isInCall,
    isMuted,
    isVideoOff,
    isScreenSharing,
    webRTCError,
    initializeMedia,
    joinChannel,
    leaveChannel,
    toggleMute,
    toggleVideo,
    toggleScreenShare,
  }
}
