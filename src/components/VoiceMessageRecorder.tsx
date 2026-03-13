import { useState, useRef, useEffect } from 'react'
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

  // 组件卸载时清理
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop())
      }
    }
  }, [])

  const startRecording = async () => {
    try {
      // 请求麦克风权限
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream

      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data)
        }
      }

      mediaRecorder.onerror = (e) => {
        console.error('录音错误:', e)
        alert('录音出错，请重试')
        handleCancel()
      }

      mediaRecorder.start(100) // 每100ms收集一次数据
      setIsRecording(true)
      setDuration(0)

      timerRef.current = setInterval(() => {
        setDuration((prev) => prev + 1)
      }, 1000)
      
      console.log('开始录音')
    } catch (err) {
      console.error('无法启动录音:', err)
      if (err instanceof Error) {
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          alert('需要麦克风权限才能录制语音消息，请在浏览器设置中允许访问麦克风')
        } else if (err.name === 'NotFoundError') {
          alert('未找到麦克风设备，请检查您的设备')
        } else {
          alert('无法启动录音: ' + err.message)
        }
      }
    }
  }

  const stopRecording = (): Promise<Blob> => {
    return new Promise((resolve) => {
      if (mediaRecorderRef.current && isRecording) {
        mediaRecorderRef.current.onstop = () => {
          const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
          resolve(blob)
        }
        
        mediaRecorderRef.current.stop()
        setIsRecording(false)

        if (timerRef.current) {
          clearInterval(timerRef.current)
        }

        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop())
        }
      } else {
        resolve(new Blob())
      }
    })
  }

  const handleSend = async () => {
    if (!isRecording && chunksRef.current.length === 0) {
      console.log('没有录音数据')
      return
    }

    // 停止录音并获取 blob
    const blob = await stopRecording()
    
    if (blob.size === 0) {
      console.log('录音文件为空')
      return
    }

    console.log('发送语音消息:', blob.size, 'bytes, 时长:', duration, '秒')
    
    try {
      await onSend(blob, duration)
      // 发送成功后清理
      chunksRef.current = []
      setDuration(0)
    } catch (err) {
      console.error('发送语音消息失败:', err)
      alert('发送语音消息失败，请重试')
    }
  }

  const handleCancel = async () => {
    if (isRecording) {
      await stopRecording()
    }
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
      <div className="flex items-center gap-2 bg-[#2b2d31] px-4 py-2 rounded-lg">
        <div className="flex-1 flex items-center gap-2">
          <div className="w-2 h-2 bg-[#f23f43] rounded-full animate-pulse" />
          <span className="text-white text-sm font-medium">录音中...</span>
          <span className="text-[#949ba4] text-xs">{formatTime(duration)}</span>
        </div>
        <button
          onClick={handleSend}
          disabled={isLoading || duration === 0}
          className="p-2 bg-[#23a559] hover:bg-[#1e8233] rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="发送语音消息"
        >
          {isLoading ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Send className="w-4 h-4 text-white" />
          )}
        </button>
        <button
          onClick={handleCancel}
          disabled={isLoading}
          className="p-2 bg-[#f23f43] hover:bg-[#d93639] rounded-full transition-colors disabled:opacity-50"
          title="取消录音"
        >
          <X className="w-4 h-4 text-white" />
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={startRecording}
      className="p-2 hover:bg-[#3f4147] rounded transition-colors"
      title="录制语音消息"
    >
      <Mic className="w-5 h-5 text-[#b5bac1] hover:text-white" />
    </button>
  )
}
