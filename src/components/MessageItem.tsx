import { useState, useEffect } from 'react'
import { Download, Play, Pause } from 'lucide-react'

interface Message {
  id: string
  content: string
  type: string
  author: {
    id: string
    username: string
  }
  timestamp: string
  voice_url?: string
  duration?: number
  attachments?: Array<{
    id: string
    filename: string
    url: string
    size: number
    content_type: string
    width?: number
    height?: number
  }>
}

interface MessageItemProps {
  message: Message
}

export function MessageItem({ message }: MessageItemProps) {
  const [showImageModal, setShowImageModal] = useState(false)
  const [selectedImage, setSelectedImage] = useState<string>('')
  const [isPlayingAudio, setIsPlayingAudio] = useState(false)
  const [audioProgress, setAudioProgress] = useState(0)
  const [showStickerModal, setShowStickerModal] = useState(false)
  const [selectedSticker, setSelectedSticker] = useState<string>('')

  // ESC 键关闭模态框
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowImageModal(false)
        setShowStickerModal(false)
      }
    }
    
    if (showImageModal || showStickerModal) {
      window.addEventListener('keydown', handleEscape)
      return () => window.removeEventListener('keydown', handleEscape)
    }
  }, [showImageModal, showStickerModal])

  const handleImageClick = (url: string) => {
    setSelectedImage(url)
    setShowImageModal(true)
  }

  const handleStickerClick = (sticker: string) => {
    setSelectedSticker(sticker)
    setShowStickerModal(true)
  }

  const renderMessageContent = () => {
    switch (message.type) {
      case 'image':
        const imageAttachment = message.attachments?.[0]
        const imageUrl = imageAttachment?.url || ''
        const width = imageAttachment?.width || 400
        const height = imageAttachment?.height || 300
        
        // 计算缩略图尺寸（最大400px宽度，保持比例）
        const maxWidth = 400
        const maxHeight = 300
        let thumbWidth = width
        let thumbHeight = height
        
        if (width > maxWidth) {
          thumbWidth = maxWidth
          thumbHeight = (height * maxWidth) / width
        }
        
        if (thumbHeight > maxHeight) {
          thumbHeight = maxHeight
          thumbWidth = (width * maxHeight) / height
        }
        
        return (
          <div className="mt-2">
            <div 
              className="relative inline-block cursor-pointer group rounded-lg overflow-hidden"
              onClick={() => handleImageClick(imageUrl)}
              style={{ width: thumbWidth, height: thumbHeight }}
            >
              <img
                src={imageUrl}
                alt={message.content}
                className="w-full h-full object-cover rounded-lg hover:opacity-90 transition-opacity"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 px-3 py-1.5 rounded text-white text-sm">
                  点击查看原图
                </div>
              </div>
              <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                {width} × {height}
              </div>
            </div>
            {message.content && (
              <p className="text-[#dbdee1] text-sm mt-1">{message.content}</p>
            )}
          </div>
        )

      case 'file':
        const fileAttachment = message.attachments?.[0]
        return (
          <div className="mt-2 bg-[#2b2d31] rounded-lg p-3 inline-flex items-center gap-3 max-w-md">
            <div className="w-12 h-12 bg-[#5865f2] rounded flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate">{message.content}</p>
              <p className="text-[#949ba4] text-xs">
                {fileAttachment?.size ? `${(fileAttachment.size / 1024).toFixed(2)} KB` : ''}
              </p>
            </div>
            <a
              href={fileAttachment?.url}
              download={message.content}
              className="text-[#00a8fc] hover:text-[#0095e8] transition-colors"
              title="下载文件"
            >
              <Download size={20} />
            </a>
          </div>
        )

      case 'voice':
        return (
          <div className="mt-2 bg-[#2b2d31] rounded-lg p-3 inline-flex items-center gap-3 max-w-md">
            <button
              onClick={() => setIsPlayingAudio(!isPlayingAudio)}
              className="w-10 h-10 bg-[#5865f2] rounded-full flex items-center justify-center hover:bg-[#4752c4] transition-colors"
            >
              {isPlayingAudio ? (
                <Pause size={20} className="text-white" />
              ) : (
                <Play size={20} className="text-white ml-0.5" />
              )}
            </button>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-white text-sm font-medium">语音消息</span>
                {message.duration && (
                  <span className="text-[#949ba4] text-xs">
                    {Math.floor(message.duration / 60)}:{(message.duration % 60).toString().padStart(2, '0')}
                  </span>
                )}
              </div>
              <div className="relative w-full h-1 bg-[#3f4147] rounded-full overflow-hidden">
                <div 
                  className="absolute left-0 top-0 h-full bg-[#5865f2] transition-all"
                  style={{ width: `${audioProgress}%` }}
                />
              </div>
            </div>
            {message.voice_url && (
              <a
                href={message.voice_url}
                download
                className="text-[#00a8fc] hover:text-[#0095e8] transition-colors"
                title="下载语音"
              >
                <Download size={18} />
              </a>
            )}
          </div>
        )

      case 'gif':
        return (
          <div className="mt-2">
            <div className="relative inline-block rounded-lg overflow-hidden bg-[#2b2d31]">
              <img
                src={message.voice_url}
                alt="GIF"
                className="max-w-md max-h-96 rounded-lg"
              />
              <div className="absolute top-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                GIF
              </div>
            </div>
            {message.content && message.content !== message.voice_url && (
              <p className="text-[#dbdee1] text-sm mt-1">{message.content}</p>
            )}
          </div>
        )

      case 'sticker':
        return (
          <div 
            className="mt-2 cursor-pointer hover:scale-110 transition-transform inline-block"
            onClick={() => handleStickerClick(message.content)}
          >
            <span className="text-6xl">{message.content}</span>
          </div>
        )

      case 'gift':
        return (
          <div className="mt-2 inline-block">
            <div className="bg-gradient-to-r from-[#5865f2] to-[#7289da] rounded-lg p-4 min-w-[200px]">
              <div className="flex items-center gap-3">
                <span className="text-5xl">{message.content}</span>
                <div className="flex-1">
                  <div className="text-white font-semibold text-lg">
                    {message.voice_url || '礼物'}
                  </div>
                  <div className="text-white/80 text-sm">
                    送出了一份礼物
                  </div>
                </div>
              </div>
            </div>
          </div>
        )

      case 'call_record':
        return (
          <div className="mt-1 bg-[#2b2d31] rounded-lg p-3 inline-block">
            <div className="flex items-center gap-2 text-[#949ba4]">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773c.058.3.102.605.102.924 0 1.748.585 3.364 1.56 4.657l1.548.773a1 1 0 01.54 1.06l-.74 4.435a1 1 0 01-.986.836H3a1 1 0 01-1-1V3z" />
              </svg>
              <span className="text-white text-sm font-medium">{message.content}</span>
            </div>
          </div>
        )

      default:
        return <p className="text-[#dbdee1] mt-0.5 break-words">{message.content}</p>
    }
  }

  return (
    <>
      <div className="flex gap-4 mb-4 px-4 py-0.5 hover:bg-[#2e3035] -mx-4 group">
        <div className="w-10 h-10 bg-[#5865f2] rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0 mt-0.5">
          {message.author.username[0].toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2">
            <span className="text-white font-medium hover:underline cursor-pointer">
              {message.author.username}
            </span>
            <span className="text-[#949ba4] text-xs">
              {new Date(message.timestamp).toLocaleString('zh-CN', {
                month: 'numeric',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>
          {renderMessageContent()}
        </div>
        <div className="opacity-0 group-hover:opacity-100 flex items-start gap-1 transition-opacity">
          <button
            className="p-1 hover:bg-[#3f4147] rounded text-[#b5bac1] hover:text-white"
            title="添加反应"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2" />
              <circle cx="8.5" cy="10" r="1.5" />
              <circle cx="15.5" cy="10" r="1.5" />
              <path d="M8 14s1.5 2 4 2 4-2 4-2" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" />
            </svg>
          </button>
          <button className="p-1 hover:bg-[#3f4147] rounded text-[#b5bac1] hover:text-white" title="更多">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="12" cy="5" r="2" />
              <circle cx="12" cy="12" r="2" />
              <circle cx="12" cy="19" r="2" />
            </svg>
          </button>
        </div>
      </div>

      {/* 图片查看模态框 */}
      {showImageModal && (
        <div
          className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4"
          onClick={() => setShowImageModal(false)}
        >
          <div className="relative w-full h-full flex items-center justify-center">
            {/* 关闭按钮 */}
            <button
              onClick={() => setShowImageModal(false)}
              className="absolute top-4 right-4 w-12 h-12 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white transition-colors z-10"
              title="关闭 (ESC)"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.4 4L12 10.4L5.6 4L4 5.6L10.4 12L4 18.4L5.6 20L12 13.6L18.4 20L20 18.4L13.6 12L20 5.6L18.4 4Z" />
              </svg>
            </button>
            
            {/* 图片容器 */}
            <div 
              className="relative max-w-[90vw] max-h-[90vh] flex items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={selectedImage}
                alt="Full size"
                className="max-w-full max-h-[90vh] w-auto h-auto object-contain rounded-lg shadow-2xl"
                style={{ imageRendering: 'high-quality' }}
              />
            </div>
            
            {/* 下载按钮 */}
            <a
              href={selectedImage}
              download
              className="absolute bottom-4 right-4 px-4 py-2 bg-[#5865f2] hover:bg-[#4752c4] rounded-lg text-white flex items-center gap-2 transition-colors shadow-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <Download size={18} />
              下载原图
            </a>
            
            {/* 图片信息 */}
            <div className="absolute bottom-4 left-4 bg-black/60 text-white text-sm px-3 py-2 rounded-lg">
              点击背景或按 ESC 关闭
            </div>
          </div>
        </div>
      )}

      {/* 贴纸放大模态框 */}
      {showStickerModal && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setShowStickerModal(false)}
        >
          <div className="relative">
            <span className="text-[200px]">{selectedSticker}</span>
            <button
              onClick={() => setShowStickerModal(false)}
              className="absolute -top-12 right-0 w-10 h-10 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white transition-colors"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.4 4L12 10.4L5.6 4L4 5.6L10.4 12L4 18.4L5.6 20L12 13.6L18.4 20L20 18.4L13.6 12L20 5.6L18.4 4Z" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </>
  )
}
