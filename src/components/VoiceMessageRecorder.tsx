import { useState, useRef } from 'react'
import { Mic, Send, X } from 'lucide-react'

interface VoiceMessageRecorderProps {
  onSend: (blob: Blob, duration: number) => Promise<void>
  isLoading?: boolean
}

export function VoiceMessageRecorder({ onSend, isLoading = false }: VoiceMessageRecorderProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [duration, setDuration] = useState(0)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const streamRef = useRef<MediaStream | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream

      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []

      mediaRecorder.ondataavailable = (e) => {
        chunksRef.current.push(e.data)
      }

      mediaRecorder.start()
      setIsRecording(true)
      setDuration(0)

      timerRef.current = setInterval(() => {
        setDuration((prev) => prev + 1)
      }, 1000)
    } catch (err) {
      console.error('Failed to start recording:', err)
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)

      if (timerRef.current) {
        clearInterval(timerRef.current)
      }

      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop())
      }
    }
  }

  const handleSend = async () => {
    if (chunksRef.current.length === 0) return

    const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
    await onSend(blob, duration)

    chunksRef.current = []
    setDuration(0)
  }

  const handleCancel = () => {
    stopRecording()
    chunksRef.current = []
    setDuration(0)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (isRecording) {
    return (
      <div className="flex items-center gap-2 bg-[#2b2d31] p-3 rounded-lg">
        <div className="flex-1 flex items-center gap-2">
          <div className="w-2 h-2 bg-[#f23f43] rounded-full animate-pulse" />
          <span className="text-white text-sm font-medium">录音中...</span>
          <span className="text-[#949ba4] text-xs">{formatTime(duration)}</span>
        </div>
        <button
          onClick={handleSend}
          disabled={isLoading}
          className="p-2 bg-[#23a559] hover:bg-[#1e8233] rounded-full transition-colors disabled:opacity-50"
          title="发送"
        >
          <Send className="w-4 h-4 text-white" />
        </button>
        <button
          onClick={handleCancel}
          className="p-2 bg-[#f23f43] hover:bg-[#d93639] rounded-full transition-colors"
          title="取消"
        >
          <X className="w-4 h-4 text-white" />
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={startRecording}
      className="p-2 bg-[#2b2d31] hover:bg-[#1e1f22] rounded-full transition-colors"
      title="发送语音消息"
    >
      <Mic className="w-5 h-5 text-white" />
    </button>
  )
}
