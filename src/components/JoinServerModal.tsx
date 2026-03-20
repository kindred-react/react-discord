import { useState } from 'react'
import { useServerStore } from '../shared/stores/serverStore'
import { useUserStore } from '../shared/stores/userStore'

type Step = 'input' | 'preview' | 'joining' | 'success'

interface GuildPreview {
  id: string
  name: string
  icon: string | null
  member_count: number
}

interface Props {
  onClose: () => void
  onJoined?: (serverId: string) => void
}

export function JoinServerModal({ onClose, onJoined }: Props) {
  const token = useUserStore((s) => s.token)
  const previewInvite = useServerStore((s) => s.previewInvite)
  const joinGuildByInvite = useServerStore((s) => s.joinGuildByInvite)

  const [code, setCode] = useState('')
  const [step, setStep] = useState<Step>('input')
  const [preview, setPreview] = useState<GuildPreview | null>(null)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const extractCode = (value: string) => {
    const match = value.match(/([a-zA-Z0-9]{6,16})$/)
    return match ? match[1] : value.trim()
  }

  const handlePreview = async () => {
    const inviteCode = extractCode(code)
    if (!inviteCode) { setError('请输入邀请码'); return }
    setIsLoading(true)
    setError('')
    const result = await previewInvite(inviteCode)
    setIsLoading(false)
    if (!result) { setError('无效的邀请链接，请确认后重试'); return }
    setPreview(result.guild)
    setStep('preview')
  }

  const handleJoin = async () => {
    if (!token || !preview) return
    const inviteCode = extractCode(code)
    setStep('joining')
    setError('')
    try {
      const result = await joinGuildByInvite(inviteCode, token)
      if (result) {
        setStep('success')
        setTimeout(() => { onJoined?.(result.guild.id); onClose() }, 1200)
      } else {
        setStep('preview')
        setError('加入失败，请稍后重试')
      }
    } catch (e: unknown) {
      setStep('preview')
      setError(e instanceof Error ? e.message : '加入失败，请稍后重试')
    }
  }

  const serverInitial = preview?.name?.[0]?.toUpperCase() ?? '?'

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-[#313338] rounded-xl w-[440px] shadow-2xl" onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className="px-6 pt-6 pb-2">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-xl font-bold text-white">加入服务器</h2>
              <p className="text-[#b5bac1] text-sm mt-1">通过邀请码加入好友的服务器</p>
            </div>
            <button onClick={onClose} className="text-[#80848e] hover:text-white transition-colors text-xl leading-none mt-0.5">×</button>
          </div>
        </div>

        <div className="px-6 pb-6 pt-4">
          {/* Success */}
          {step === 'success' && (
            <div className="flex flex-col items-center py-8 gap-4">
              <div className="w-16 h-16 rounded-full bg-[#23a55a] flex items-center justify-center text-3xl">
                ✓
              </div>
              <p className="text-white font-semibold text-lg">成功加入 {preview?.name}!</p>
            </div>
          )}

          {/* Preview */}
          {(step === 'preview' || step === 'joining') && preview && (
            <div className="mb-5">
              <div className="flex items-center gap-4 p-4 bg-[#2b2d31] rounded-xl border border-[#3f4147]">
                <div className="w-14 h-14 rounded-2xl bg-[#5865f2] flex items-center justify-center text-white text-2xl font-bold flex-shrink-0 overflow-hidden">
                  {preview.icon
                    ? <img src={preview.icon} alt={preview.name} className="w-full h-full object-cover" />
                    : serverInitial}
                </div>
                <div>
                  <p className="text-white font-bold text-base">{preview.name}</p>
                  <p className="text-[#b5bac1] text-sm mt-0.5">
                    <span className="inline-flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#23a55a] inline-block"></span>
                      {preview.member_count} 位成员
                    </span>
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Input */}
          {(step === 'input' || step === 'preview') && (
            <div className="mb-4">
              <label className="text-xs font-bold text-[#b5bac1] uppercase tracking-wide block mb-2">
                邀请链接
              </label>
              <input
                autoFocus
                type="text"
                value={code}
                onChange={(e) => { setCode(e.target.value); setError(''); setStep('input'); setPreview(null) }}
                onKeyDown={(e) => e.key === 'Enter' && !isLoading && handlePreview()}
                placeholder="https://discord.gg/xxxxxxxx"
                className="w-full bg-[#1e1f22] text-white px-3 py-2.5 rounded-md text-sm outline-none focus:ring-2 focus:ring-[#5865f2] placeholder-[#6d6f78] transition-all"
              />
              <p className="text-[#b5bac1] text-xs mt-2">邀请码示例：aBcDeFgH</p>
            </div>
          )}

          {/* Error */}
          {error && (
            <p className="text-[#f23f43] text-sm mb-4">{error}</p>
          )}

          {/* Actions */}
          {step !== 'success' && (
            <div className="flex gap-3 justify-end">
              <button
                onClick={onClose}
                className="px-4 py-2 text-white text-sm font-medium hover:underline"
              >
                取消
              </button>
              {step === 'input' && (
                <button
                  onClick={handlePreview}
                  disabled={isLoading || !code.trim()}
                  className="px-5 py-2 bg-[#5865f2] hover:bg-[#4752c4] disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-md transition-colors flex items-center gap-2"
                >
                  {isLoading && (
                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  )}
                  查找服务器
                </button>
              )}
              {step === 'preview' && (
                <button
                  onClick={handleJoin}
                  className="px-5 py-2 bg-[#23a55a] hover:bg-[#1a8a48] text-white text-sm font-semibold rounded-md transition-colors"
                >
                  加入服务器
                </button>
              )}
              {step === 'joining' && (
                <button disabled className="px-5 py-2 bg-[#23a55a] opacity-60 text-white text-sm font-semibold rounded-md flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  加入中...
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
