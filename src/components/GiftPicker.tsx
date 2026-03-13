import { X } from 'lucide-react'
import { useEffect, useRef } from 'react'

interface Gift {
  id: string
  name: string
  emoji: string
  price: number
  description: string
}

const gifts: Gift[] = [
  { id: 'rose', name: '玫瑰', emoji: '🌹', price: 1, description: '送你一朵玫瑰' },
  { id: 'heart', name: '爱心', emoji: '❤️', price: 2, description: '表达爱意' },
  { id: 'gift', name: '礼物', emoji: '🎁', price: 5, description: '精美礼物' },
  { id: 'cake', name: '蛋糕', emoji: '🎂', price: 10, description: '生日快乐' },
  { id: 'diamond', name: '钻石', emoji: '💎', price: 20, description: '珍贵钻石' },
  { id: 'crown', name: '皇冠', emoji: '👑', price: 50, description: '尊贵皇冠' },
  { id: 'rocket', name: '火箭', emoji: '🚀', price: 100, description: '超级火箭' },
  { id: 'trophy', name: '奖杯', emoji: '🏆', price: 200, description: '冠军奖杯' },
]

interface GiftPickerProps {
  onSelect: (gift: Gift) => void
  onClose: () => void
}

export function GiftPicker({ onSelect, onClose }: GiftPickerProps) {
  const pickerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        onClose()
      }
    }

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [onClose])

  return (
    <div className="absolute bottom-full right-0 mb-2 z-50">
      <div
        ref={pickerRef}
        className="bg-[#2b2d31] rounded-lg shadow-2xl border border-[#1e1f22] w-80 max-h-96 overflow-hidden"
      >
        {/* 头部 */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#1e1f22]">
          <h3 className="text-white font-semibold">选择礼物</h3>
          <button
            onClick={onClose}
            className="text-[#b5bac1] hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* 礼物列表 */}
        <div className="p-2 overflow-y-auto max-h-80">
          <div className="grid grid-cols-2 gap-2">
            {gifts.map((gift) => (
              <button
                key={gift.id}
                onClick={() => {
                  onSelect(gift)
                  onClose()
                }}
                className="flex flex-col items-center gap-2 p-3 bg-[#313338] hover:bg-[#3f4147] rounded-lg transition-colors group"
              >
                <span className="text-4xl group-hover:scale-110 transition-transform">
                  {gift.emoji}
                </span>
                <div className="text-center">
                  <div className="text-white text-sm font-medium">{gift.name}</div>
                  <div className="text-[#949ba4] text-xs">{gift.description}</div>
                  <div className="text-[#5865f2] text-xs font-semibold mt-1">
                    {gift.price} 金币
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* 底部提示 */}
        <div className="px-4 py-2 bg-[#1e1f22] text-[#949ba4] text-xs text-center">
          点击礼物发送给频道中的所有人
        </div>
      </div>
    </div>
  )
}

export type { Gift }
