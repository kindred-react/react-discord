import { useState, useEffect, useRef } from 'react'
import { useServerStore } from '../shared/stores/serverStore'
import { useUserStore } from '../shared/stores/userStore'
import { Check, Copy, Link, RefreshCw, X } from 'lucide-react'

interface Props {
  guildId: string
  guildName: string
  onClose: () => void
}

const EXPIRE_OPTIONS = [
  { label: '30 分钟', hours: 0.5 },
  { label: '1 小时', hours: 1 },
  { label: '6 小时', hours: 6 },
  { label: '12 小时', hours: 12 },
  { label: '1 天', hours: 24 },
  { label: '7 天', hours: 168 },
  { label: '永不过期', hours: 0 },
]

const MAX_USE_OPTIONS = [
  { label: '无限制', value: 0 },
  { label: '1 次', value: 1 },
  { label: '5 次', value: 5 },
  { label: '10 次', value: 10 },
  { label: '25 次', value: 25 },
  { label: '50 次', value: 50 },
  { label: '100 次', value: 100 },
]

export function InviteModal({ guildId, guildName, onClose }: Props) {
  const token = useUserStore((s) => s.token)
  const generateInvite = useServerStore((s) => s.generateInvite)

  const [code, setCode] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [copied, setCopied] = useState(false)
  const [expireHours, setExpireHours] = useState(24)
  const [maxUses, setMaxUses] = useState(0)
  const [showSettings, setShowSettings] = useState(false)
  const settingsRef = useRef<HTMLDivElement>(null)

  const inviteLink = code ? `${window.location.origin}/invite/${code}` : ''

  const generate = async () => {
    if (!token) return
    setIsGenerating(true)
    setCopied(false)
    const newCode = await generateInvite(guildId, token, maxUses, expireHours)
    setCode(newCode)
    setIsGenerating(false)
  }

  useEffect(() => {
    generate()
  }, [])

  // Close settings dropdown on outside click
  useEffect(() => {
    if (!showSettings) return
    const handler = (e: MouseEvent) => {
      if (settingsRef.current && !settingsRef.current.contains(e.target as Node)) {
        setShowSettings(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [showSettings])

  const handleCopy = async () => {
    if (!inviteLink) return
    try {
      await navigator.clipboard.writeText(inviteLink)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // fallback
      const el = document.createElement('textarea')
      el.value = inviteLink
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleRegenerate = () => {
    setShowSettings(false)
    generate()
  }

  const expireLabel = EXPIRE_OPTIONS.find(o => o.hours === expireHours)?.label ?? '1 天'
  const maxUsesLabel = MAX_USE_OPTIONS.find(o => o.value === maxUses)?.label ?? '无限制'

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={onClose}>
      <div
        className="bg-[#313338] rounded-xl w-[460px] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 pt-6 pb-4 flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">邀请好友</h2>
            <p className="text-[#b5bac1] text-sm mt-1">
              邀请他们加入 <span className="text-white font-semibold">{guildName}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-[#80848e] hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="px-6 pb-6">
          {/* Invite Link Box */}
          <div className="mb-4">
            <label className="text-xs font-bold text-[#b5bac1] uppercase tracking-wide block mb-2">
              服务器邀请链接
            </label>
            <div className="flex gap-2">
              <div className="flex-1 bg-[#1e1f22] rounded-lg px-3 py-2.5 flex items-center gap-2 min-w-0">
                <Link size={16} className="text-[#80848e] flex-shrink-0" />
                <span className="text-[#b5bac1] text-sm truncate flex-1">
                  {isGenerating ? '生成中...' : (inviteLink || '加载中...')}
                </span>
              </div>
              <button
                onClick={handleCopy}
                disabled={!code || isGenerating}
                className={`px-4 py-2.5 rounded-lg text-sm font-semibold transition-all flex items-center gap-1.5 flex-shrink-0 ${
                  copied
                    ? 'bg-[#23a55a] text-white'
                    : 'bg-[#5865f2] hover:bg-[#4752c4] text-white disabled:opacity-50 disabled:cursor-not-allowed'
                }`}
              >
                {copied ? (
                  <><Check size={14} /> 已复制!</>
                ) : (
                  <><Copy size={14} /> 复制</>
                )}
              </button>
            </div>
          </div>

          {/* Settings Row */}
          <div className="relative" ref={settingsRef}>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="text-[#00a8fc] text-sm hover:underline flex items-center gap-1"
            >
              你的邀请链接将在<span className="font-semibold">{expireLabel}</span>后过期
              {maxUses > 0 && <span className="text-[#b5bac1]">，最多使用 {maxUsesLabel}</span>}。
              <span className="text-[#00a8fc] ml-1">修改邀请链接</span>
            </button>

            {showSettings && (
              <div className="absolute top-8 left-0 bg-[#111214] border border-[#3f4147] rounded-xl shadow-2xl w-80 z-10 p-4">
                <h3 className="text-xs font-bold text-[#b5bac1] uppercase tracking-wide mb-3">邀请链接设置</h3>

                {/* Expire */}
                <div className="mb-3">
                  <label className="text-xs text-[#b5bac1] block mb-1.5">有效期</label>
                  <select
                    value={expireHours}
                    onChange={(e) => setExpireHours(Number(e.target.value))}
                    className="w-full bg-[#1e1f22] text-white text-sm px-3 py-2 rounded-md outline-none border border-[#3f4147] focus:border-[#5865f2] cursor-pointer"
                  >
                    {EXPIRE_OPTIONS.map((o) => (
                      <option key={o.hours} value={o.hours}>{o.label}</option>
                    ))}
                  </select>
                </div>

                {/* Max Uses */}
                <div className="mb-4">
                  <label className="text-xs text-[#b5bac1] block mb-1.5">最大使用次数</label>
                  <select
                    value={maxUses}
                    onChange={(e) => setMaxUses(Number(e.target.value))}
                    className="w-full bg-[#1e1f22] text-white text-sm px-3 py-2 rounded-md outline-none border border-[#3f4147] focus:border-[#5865f2] cursor-pointer"
                  >
                    {MAX_USE_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={handleRegenerate}
                  disabled={isGenerating}
                  className="w-full py-2 bg-[#5865f2] hover:bg-[#4752c4] disabled:opacity-50 text-white text-sm font-semibold rounded-md transition-colors flex items-center justify-center gap-2"
                >
                  <RefreshCw size={14} className={isGenerating ? 'animate-spin' : ''} />
                  生成新链接
                </button>
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="border-t border-[#3f4147] my-5" />

          {/* Quick Copy Section */}
          <div>
            <p className="text-xs font-bold text-[#b5bac1] uppercase tracking-wide mb-3">或者分享邀请码</p>
            <div className="flex items-center gap-3 bg-[#2b2d31] rounded-lg px-4 py-3">
              <div className="flex-1 min-w-0">
                <p className="text-[#b5bac1] text-xs mb-0.5">邀请码</p>
                <p className="text-white font-mono font-semibold text-base tracking-wider truncate">
                  {isGenerating ? '...' : (code ?? '—')}
                </p>
              </div>
              <button
                onClick={() => {
                  if (!code) return
                  navigator.clipboard.writeText(code).catch(() => {})
                  setCopied(true)
                  setTimeout(() => setCopied(false), 2000)
                }}
                disabled={!code || isGenerating}
                className="p-2 rounded-md bg-[#1e1f22] hover:bg-[#35373c] text-[#b5bac1] hover:text-white transition-colors disabled:opacity-40"
                title="复制邀请码"
              >
                {copied ? <Check size={16} className="text-[#23a55a]" /> : <Copy size={16} />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
