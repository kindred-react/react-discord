import { create } from 'zustand'

interface WebRTCState {
  localStream: MediaStream | null
  remoteStreams: Map<string, MediaStream>
  isInCall: boolean
  currentChannelId: string | null
  isMuted: boolean
  isDeafened: boolean
  isSpeaking: boolean
  initLocalStream: () => Promise<void>
  joinVoiceChannel: (channelId: string) => Promise<void>
  leaveVoiceChannel: () => void
  toggleMute: () => void
  toggleDeafen: () => void
}

export const useWebRTCStore = create<WebRTCState>((set, get) => ({
  localStream: null,
  remoteStreams: new Map(),
  isInCall: false,
  currentChannelId: null,
  isMuted: false,
  isDeafened: false,
  isSpeaking: false,

  initLocalStream: async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false })
      set({ localStream: stream })
    } catch (error) {
      console.error('Failed to get user media:', error)
    }
  },

  joinVoiceChannel: async (channelId: string) => {
    const { initLocalStream } = get()
    await initLocalStream()
    set({ isInCall: true, currentChannelId: channelId })
  },

  leaveVoiceChannel: () => {
    const { localStream } = get()
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop())
    }
    set({
      localStream: null,
      remoteStreams: new Map(),
      isInCall: false,
      currentChannelId: null,
      isMuted: false,
      isDeafened: false,
      isSpeaking: false,
    })
  },

  toggleMute: () => {
    const { localStream, isMuted } = get()
    if (localStream) {
      localStream.getAudioTracks().forEach(track => {
        track.enabled = isMuted
      })
    }
    set({ isMuted: !isMuted })
  },

  toggleDeafen: () => {
    const { isDeafened } = get()
    set({ isDeafened: !isDeafened })
  },
}))
