import { useState } from 'react'

interface GifPickerProps {
  onSelect: (gifUrl: string) => void
  onClose: () => void
}

export function GifPicker({ onSelect, onClose }: GifPickerProps) {
  const [searchTerm, setSearchTerm] = useState('')

  // 模拟 GIF 数据
  const mockGifs = [
    { id: 1, url: 'https://media.giphy.com/media/3o7abKhOpu0NwenH3O/giphy.gif', title: 'Happy' },
    { id: 2, url: 'https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.gif', title: 'Dance' },
    { id: 3, url: 'https://media.giphy.com/media/3o6Zt6KHxJTbXCnSvu/giphy.gif', title: 'Excited' },
    { id: 4, url: 'https://media.giphy.com/media/l0HlRnAWXxn0MhKLK/giphy.gif', title: 'Laugh' },
    { id: 5, url: 'https://media.giphy.com/media/3o7absbD7PbTFQa0c8/giphy.gif', title: 'Celebrate' },
    { id: 6, url: 'https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.gif', title: 'Party' },
  ]

  const filteredGifs = searchTerm
    ? mockGifs.filter(gif => gif.title.toLowerCase().includes(searchTerm.toLowerCase()))
    : mockGifs

  return (
    <div className="absolute bottom-full right-0 mb-2 bg-[#2b2d31] rounded-lg shadow-xl w-96 max-h-[500px] overflow-hidden">
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
      <div className="p-4 overflow-y-auto max-h-96">
        {filteredGifs.length > 0 ? (
          <div className="grid grid-cols-2 gap-2">
            {filteredGifs.map((gif) => (
              <button
                key={gif.id}
                onClick={() => {
                  onSelect(gif.url)
                  onClose()
                }}
                className="relative aspect-square bg-[#383a40] rounded overflow-hidden hover:ring-2 hover:ring-[#5865f2] transition-all group"
              >
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-4xl">🎬</div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {gif.title}
                </div>
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
      <div className="p-3 border-t border-[#3f4147] text-center">
        <a
          href="https://giphy.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#00a8fc] text-xs hover:underline"
        >
          由 GIPHY 提供支持
        </a>
      </div>
    </div>
  )
}
