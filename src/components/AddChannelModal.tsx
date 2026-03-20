import { useState } from 'react'
import { Hash, Volume2 } from 'lucide-react'
import { useServerStore } from '../shared/stores/serverStore'
import { useUserStore } from '../shared/stores/userStore'

interface AddChannelModalProps {
  guildId: string
  onClose: () => void
  onCreated?: () => void
}

export function AddChannelModal({ guildId, onClose, onCreated }: AddChannelModalProps) {
  const token = useUserStore((s) => s.token)
  const createChannel = useServerStore((s) => s.createChannel)

  const [channelName, setChannelName] = useState('')
  const [channelType, setChannelType] = useState<'text' | 'voice'>('text')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const name = channelName.trim().replace(/\s+/g, '-').toLowerCase()
    if (!name || !token) return

    setIsLoading(true)
    setError('')
    try {
      await createChannel(guildId, name, channelType, token)
      setChannelName('')
      onCreated?.()
      onClose()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '创建失败')
    } finally {
      setIsLoading(false)
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
            onChange={(e) => { setChannelName(e.target.value); setError('') }}
            placeholder={channelType === 'text' ? 'welcome' : 'voice-chat'}
            className="w-full bg-[#1e1f22] text-white pl-10 pr-4 py-2 rounded outline-none focus:ring-2 focus:ring-[#5865f2] placeholder-[#949ba4]"
          />
        </div>
        <p className="text-xs text-[#949ba4] mt-2">
          频道名称中的空格会自动替换为短横线
        </p>
        {error && <p className="text-xs text-[#f23f43] mt-1">{error}</p>}
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
          disabled={!channelName.trim() || isLoading}
          className="px-4 py-2 bg-[#5865f2] text-white rounded hover:bg-[#4752c4] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isLoading && <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>}
          创建频道
        </button>
      </div>
    </form>
  )
}
