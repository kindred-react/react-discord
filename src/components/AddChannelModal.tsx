import { useState } from 'react'
import { Hash, Volume2 } from 'lucide-react'

interface AddChannelModalProps {
  onClose: () => void
}

export function AddChannelModal({ onClose }: AddChannelModalProps) {
  const [channelName, setChannelName] = useState('')
  const [channelType, setChannelType] = useState<'text' | 'voice'>('text')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (channelName.trim()) {
      console.log('Add channel:', channelName, channelType)
      setChannelName('')
      onClose()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-[#949ba4] mb-2">
          频道类型
        </label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setChannelType('text')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded transition-colors ${
              channelType === 'text' 
                ? 'bg-[#5865f2] text-white' 
                : 'bg-[#1e1f22] text-[#949ba4] hover:bg-[#35373c]'
            }`}
          >
            <Hash size={18} />
            文字频道
          </button>
          <button
            type="button"
            onClick={() => setChannelType('voice')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded transition-colors ${
              channelType === 'voice' 
                ? 'bg-[#5865f2] text-white' 
                : 'bg-[#1e1f22] text-[#949ba4] hover:bg-[#35373c]'
            }`}
          >
            <Volume2 size={18} />
            语音频道
          </button>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-[#949ba4] mb-2">
          频道名称
        </label>
        <div className="relative">
          {channelType === 'text' ? (
            <Hash size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#80848e]" />
          ) : (
            <Volume2 size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#80848e]" />
          )}
          <input
            type="text"
            value={channelName}
            onChange={(e) => setChannelName(e.target.value)}
            placeholder={channelType === 'text' ? 'welcome' : 'voice-chat'}
            className="w-full bg-[#1e1f22] text-white pl-10 pr-4 py-2 rounded outline-none focus:ring-2 focus:ring-[#5865f2] placeholder-[#949ba4]"
          />
        </div>
        <p className="text-xs text-[#949ba4] mt-2">
          频道名称不能包含空格，请使用短横线或下划线
        </p>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-[#949ba4] hover:text-white transition-colors"
        >
          取消
        </button>
        <button
          type="submit"
          disabled={!channelName.trim()}
          className="px-4 py-2 bg-[#5865f2] text-white rounded hover:bg-[#4752c4] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          创建频道
        </button>
      </div>
    </form>
  )
}
