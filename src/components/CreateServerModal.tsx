import { useState } from 'react'
import { useServerStore } from '../shared/stores/serverStore'
import { useUserStore } from '../shared/stores/userStore'
import type { Server } from '../shared/types'

interface Props {
  onClose: () => void
  onCreated?: (server: Server) => void
}

export function CreateServerModal({ onClose, onCreated }: Props) {
  const token = useUserStore((s) => s.token)
  const createGuild = useServerStore((s) => s.createGuild)
  const user = useUserStore((s) => s.user)

  const [name, setName] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleCreate = async () => {
    if (!name.trim()) { setError('请输入服务器名称'); return }
    if (!token) return
    setIsLoading(true)
    setError('')
    const server = await createGuild(name.trim(), token)
    setIsLoading(false)
    if (server) {
      onCreated?.(server)
      onClose()
    } else {
      setError('创建失败，请稍后重试')
    }
  }

  const initial = name.trim()?.[0]?.toUpperCase()
  const placeholder = `${user?.username ?? '用户'}的服务器`

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-[#313338] rounded-xl w-[440px] shadow-2xl relative" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#80848e] hover:text-white transition-colors text-2xl leading-none"
        >
          ×
        </button>

        <div className="px-6 pt-8 pb-2 text-center">
          <h2 className="text-xl font-bold text-white">创建服务器</h2>
          <p className="text-[#b5bac1] text-sm mt-2">
            你的服务器是你和朋友们聚集的地方。<br />创建一个并开始聊天吧！
          </p>
        </div>

        <div className="px-6 pb-6 pt-4">
          {/* Icon preview */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 rounded-full bg-[#5865f2] flex items-center justify-center text-white text-3xl font-bold border-4 border-dashed border-[#3f4147]">
              {initial || <span className="text-[#b5bac1] text-2xl">+</span>}
            </div>
          </div>

          {/* Name input */}
          <div className="mb-5">
            <label className="text-xs font-bold text-[#b5bac1] uppercase tracking-wide block mb-2">
              服务器名称
            </label>
            <input
              autoFocus
              type="text"
              value={name}
              onChange={(e) => { setName(e.target.value); setError('') }}
              onKeyDown={(e) => e.key === 'Enter' && !isLoading && handleCreate()}
              placeholder={placeholder}
              maxLength={100}
              className="w-full bg-[#1e1f22] text-white px-3 py-2.5 rounded-md text-sm outline-none focus:ring-2 focus:ring-[#5865f2] placeholder-[#6d6f78] transition-all"
            />
          </div>

          {error && <p className="text-[#f23f43] text-sm mb-4">{error}</p>}

          <p className="text-[#b5bac1] text-xs mb-5">
            通过创建服务器，即表示您同意 Discord 的
            <span className="text-[#00a8fc] cursor-pointer"> 社区准则</span>。
          </p>

          <div className="flex gap-3 justify-between">
            <button
              onClick={onClose}
              className="px-4 py-2 text-white text-sm font-medium hover:underline"
            >
              返回
            </button>
            <button
              onClick={handleCreate}
              disabled={isLoading || !name.trim()}
              className="px-5 py-2.5 bg-[#5865f2] hover:bg-[#4752c4] disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-md transition-colors flex items-center gap-2"
            >
              {isLoading && (
                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              )}
              创建服务器
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
