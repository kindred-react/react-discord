import { useState, useEffect, useRef } from 'react'

interface StickerPickerProps {
  onSelect: (sticker: string) => void
  onClose: () => void
}

export function StickerPicker({ onSelect, onClose }: StickerPickerProps) {
  const [activeTab, setActiveTab] = useState<'recent' | 'all'>('all')
  const containerRef = useRef<HTMLDivElement>(null)

  // ESC 键关闭
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }
    
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [onClose])

  // 点击外部关闭
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    
    // 延迟添加监听器，避免立即触发
    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside)
    }, 100)
    
    return () => {
      clearTimeout(timer)
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [onClose])

  const stickers = [
    '👍', '👎', '❤️', '😂', '😮', '😢', '😡', '🎉',
    '🔥', '⭐', '✨', '💯', '🎯', '🎨', '🎭', '🎪',
    '🎸', '🎹', '🎺', '🎻', '🎮', '🎲', '🎰', '🎳',
    '⚽', '🏀', '🏈', '⚾', '🎾', '🏐', '🏉', '🎱',
    '🍕', '🍔', '🍟', '🌭', '🍿', '🧂', '🥓', '🥚',
    '🍞', '🥐', '🥖', '🥨', '🥯', '🧀', '🥗', '🥙',
  ]

  return (
    <div 
      ref={containerRef}
      className="absolute bottom-full right-0 mb-2 bg-[#2b2d31] rounded-lg shadow-xl w-96 max-h-96 overflow-hidden z-50"
    >
      <div className="p-4 border-b border-[#3f4147]">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-white font-semibold">贴纸</h3>
          <button
            onClick={onClose}
            className="text-[#b5bac1] hover:text-white transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.4 4L12 10.4L5.6 4L4 5.6L10.4 12L4 18.4L5.6 20L12 13.6L18.4 20L20 18.4L13.6 12L20 5.6L18.4 4Z" />
            </svg>
          </button>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
              activeTab === 'all'
                ? 'bg-[#5865f2] text-white'
                : 'bg-[#3f4147] text-[#b5bac1] hover:text-white'
            }`}
          >
            全部
          </button>
          <button
            onClick={() => setActiveTab('recent')}
            className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
              activeTab === 'recent'
                ? 'bg-[#5865f2] text-white'
                : 'bg-[#3f4147] text-[#b5bac1] hover:text-white'
            }`}
          >
            最近使用
          </button>
        </div>
      </div>
      <div className="p-4 overflow-y-auto max-h-80">
        <div className="grid grid-cols-8 gap-2">
          {stickers.map((sticker, index) => (
            <button
              key={index}
              onClick={() => {
                onSelect(sticker)
                onClose()
              }}
              className="text-3xl hover:bg-[#383a40] rounded p-2 transition-all hover:scale-110"
              title={sticker}
            >
              {sticker}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
