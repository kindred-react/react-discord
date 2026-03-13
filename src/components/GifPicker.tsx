import { useState, useEffect, useRef } from 'react'

interface GifPickerProps {
  onSelect: (gifUrl: string) => void
  onClose: () => void
}

export function GifPicker({ onSelect, onClose }: GifPickerProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [hoveredGif, setHoveredGif] = useState<string | null>(null)
  const [previewPosition, setPreviewPosition] = useState<{ x: number; y: number } | null>(null)
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

  // 使用真实的 GIF URLs
  const mockGifs = [
    { id: 1, url: 'https://media1.tenor.com/m/x8v1oNUOmg4AAAAd/rickroll-roll.gif', title: 'Dance' },
    { id: 2, url: 'https://media1.tenor.com/m/lx2WSGRk8bcAAAAC/pulp-fiction-john-travolta.gif', title: 'Confused' },
    { id: 3, url: 'https://media1.tenor.com/m/blAx4vYKYywAAAAC/yes-yeah.gif', title: 'Yes' },
    { id: 4, url: 'https://media1.tenor.com/m/wLqJe1YXhqsAAAAC/cat-cute.gif', title: 'Cat' },
    { id: 5, url: 'https://media1.tenor.com/m/0AVbKGY_MxMAAAAC/party-time.gif', title: 'Party' },
    { id: 6, url: 'https://media1.tenor.com/m/Ht7D7FqLkqsAAAAC/love-heart.gif', title: 'Love' },
    { id: 7, url: 'https://media1.tenor.com/m/fSv9S6BaBwkAAAAC/fire-flame.gif', title: 'Fire' },
    { id: 8, url: 'https://media1.tenor.com/m/TKpmJa0wWq0AAAAC/star-stars.gif', title: 'Star' },
    { id: 9, url: 'https://media1.tenor.com/m/5oDlq8rB_UYAAAAC/100-hundred.gif', title: '100' },
    { id: 10, url: 'https://media1.tenor.com/m/kHcmsz854VkAAAAC/clap-clapping.gif', title: 'Clap' },
    { id: 11, url: 'https://media1.tenor.com/m/wLqJe1YXhqsAAAAC/cat-cute.gif', title: 'Happy' },
    { id: 12, url: 'https://media1.tenor.com/m/x8v1oNUOmg4AAAAd/rickroll-roll.gif', title: 'Cool' },
    { id: 13, url: 'https://media1.tenor.com/m/lx2WSGRk8bcAAAAC/pulp-fiction-john-travolta.gif', title: 'Think' },
    { id: 14, url: 'https://media1.tenor.com/m/blAx4vYKYywAAAAC/yes-yeah.gif', title: 'Agree' },
    { id: 15, url: 'https://media1.tenor.com/m/0AVbKGY_MxMAAAAC/party-time.gif', title: 'Celebrate' },
    { id: 16, url: 'https://media1.tenor.com/m/Ht7D7FqLkqsAAAAC/love-heart.gif', title: 'Heart' },
    { id: 17, url: 'https://media1.tenor.com/m/fSv9S6BaBwkAAAAC/fire-flame.gif', title: 'Hot' },
    { id: 18, url: 'https://media1.tenor.com/m/TKpmJa0wWq0AAAAC/star-stars.gif', title: 'Shine' },
    { id: 19, url: 'https://media1.tenor.com/m/5oDlq8rB_UYAAAAC/100-hundred.gif', title: 'Perfect' },
    { id: 20, url: 'https://media1.tenor.com/m/kHcmsz854VkAAAAC/clap-clapping.gif', title: 'Applause' },
    { id: 21, url: 'https://media1.tenor.com/m/wLqJe1YXhqsAAAAC/cat-cute.gif', title: 'Cute' },
    { id: 22, url: 'https://media1.tenor.com/m/x8v1oNUOmg4AAAAd/rickroll-roll.gif', title: 'Groove' },
    { id: 23, url: 'https://media1.tenor.com/m/lx2WSGRk8bcAAAAC/pulp-fiction-john-travolta.gif', title: 'Lost' },
    { id: 24, url: 'https://media1.tenor.com/m/blAx4vYKYywAAAAC/yes-yeah.gif', title: 'Nod' },
    { id: 25, url: 'https://media1.tenor.com/m/0AVbKGY_MxMAAAAC/party-time.gif', title: 'Fun' },
    { id: 26, url: 'https://media1.tenor.com/m/Ht7D7FqLkqsAAAAC/love-heart.gif', title: 'Like' },
    { id: 27, url: 'https://media1.tenor.com/m/fSv9S6BaBwkAAAAC/fire-flame.gif', title: 'Lit' },
    { id: 28, url: 'https://media1.tenor.com/m/TKpmJa0wWq0AAAAC/star-stars.gif', title: 'Sparkle' },
    { id: 29, url: 'https://media1.tenor.com/m/5oDlq8rB_UYAAAAC/100-hundred.gif', title: 'Best' },
    { id: 30, url: 'https://media1.tenor.com/m/kHcmsz854VkAAAAC/clap-clapping.gif', title: 'Bravo' },
    { id: 31, url: 'https://media1.tenor.com/m/wLqJe1YXhqsAAAAC/cat-cute.gif', title: 'Smile' },
    { id: 32, url: 'https://media1.tenor.com/m/x8v1oNUOmg4AAAAd/rickroll-roll.gif', title: 'Move' },
    { id: 33, url: 'https://media1.tenor.com/m/lx2WSGRk8bcAAAAC/pulp-fiction-john-travolta.gif', title: 'What' },
    { id: 34, url: 'https://media1.tenor.com/m/blAx4vYKYywAAAAC/yes-yeah.gif', title: 'OK' },
    { id: 35, url: 'https://media1.tenor.com/m/0AVbKGY_MxMAAAAC/party-time.gif', title: 'Yay' },
    { id: 36, url: 'https://media1.tenor.com/m/Ht7D7FqLkqsAAAAC/love-heart.gif', title: 'Love' },
    { id: 37, url: 'https://media1.tenor.com/m/fSv9S6BaBwkAAAAC/fire-flame.gif', title: 'Burn' },
    { id: 38, url: 'https://media1.tenor.com/m/TKpmJa0wWq0AAAAC/star-stars.gif', title: 'Glow' },
    { id: 39, url: 'https://media1.tenor.com/m/5oDlq8rB_UYAAAAC/100-hundred.gif', title: 'Top' },
    { id: 40, url: 'https://media1.tenor.com/m/kHcmsz854VkAAAAC/clap-clapping.gif', title: 'Nice' },
  ]

  const filteredGifs = searchTerm
    ? mockGifs.filter(gif => gif.title.toLowerCase().includes(searchTerm.toLowerCase()))
    : mockGifs

  return (
    <>
      {/* 悬停预览 - 跟随 GIF 位置显示 */}
      {hoveredGif && previewPosition && (
        <div 
          className="fixed pointer-events-none z-[9999]"
          style={{
            left: `${previewPosition.x}px`,
            top: `${previewPosition.y}px`,
            transform: 'translate(-50%, -100%) translateY(-10px)'
          }}
        >
          <div className="bg-[#1e1f22] rounded-lg shadow-2xl p-3 border-2 border-[#5865f2]">
            <img
              src={hoveredGif}
              alt="Preview"
              className="rounded"
              style={{ width: '250px', height: '250px', objectFit: 'contain' }}
            />
          </div>
        </div>
      )}
      
      <div 
        ref={containerRef}
        className="absolute bottom-full right-0 mb-2 bg-[#2b2d31] rounded-lg shadow-xl overflow-visible z-50" 
        style={{ width: '640px' }}
      >
      <div className="p-4 border-b border-[#3f4147]">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-white font-semibold">选择 GIF</h3>
          <button
            onClick={onClose}
            className="text-[#b5bac1] hover:text-white transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.4 4L12 10.4L5.6 4L4 5.6L10.4 12L4 18.4L5.6 20L12 13.6L18.4 20L20 18.4L13.6 12L20 5.6L18.4 4Z" />
            </svg>
          </button>
        </div>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="搜索 GIF"
          className="w-full bg-[#1e1f22] text-white px-3 py-2 rounded outline-none placeholder-[#6d6f78] text-sm"
        />
      </div>
      
      {/* GIF 网格 - 8列5行 */}
      <div className="overflow-y-auto" style={{ height: '400px' }}>
        <div className="p-2">
          {filteredGifs.length > 0 ? (
            <div className="grid grid-cols-8 gap-1">
              {filteredGifs.map((gif) => (
                <button
                  key={gif.id}
                  onClick={() => {
                    onSelect(gif.url)
                    onClose()
                  }}
                  onMouseEnter={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect()
                    setPreviewPosition({
                      x: rect.left + rect.width / 2,
                      y: rect.top
                    })
                    setHoveredGif(gif.url)
                  }}
                  onMouseLeave={() => {
                    setHoveredGif(null)
                    setPreviewPosition(null)
                  }}
                  className="relative aspect-square bg-[#383a40] rounded overflow-hidden hover:ring-2 hover:ring-[#5865f2] transition-all group"
                  title={gif.title}
                >
                  <img
                    src={gif.url}
                    alt={gif.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-[#b5bac1] text-sm">未找到 GIF</div>
              <div className="text-[#6d6f78] text-xs mt-1">尝试其他搜索词</div>
            </div>
          )}
        </div>
      </div>
      
      <div className="p-3 border-t border-[#3f4147] text-center">
        <a
          href="https://tenor.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#00a8fc] text-xs hover:underline"
        >
          由 Tenor 提供支持
        </a>
      </div>
    </div>
    </>
  )
}
