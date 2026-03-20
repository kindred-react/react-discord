import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useUserStore } from '../shared/stores/userStore'
import { useServerStore } from '../shared/stores/serverStore'

type PageState = 'loading' | 'invalid' | 'guest' | 'member' | 'joinable' | 'joining' | 'joined' | 'error'

interface GuildPreview {
  id: string
  name: string
  icon: string | null
  member_count: number
}

export function InviteLandingPage() {
  const { code } = useParams<{ code: string }>()
  const navigate = useNavigate()

  const isAuthenticated = useUserStore((s) => s.isAuthenticated)
  const token = useUserStore((s) => s.token)

  const previewInvite = useServerStore((s) => s.previewInvite)
  const joinGuildByInvite = useServerStore((s) => s.joinGuildByInvite)
  const checkMembership = useServerStore((s) => s.checkMembership)

  const [pageState, setPageState] = useState<PageState>('loading')
  const [guild, setGuild] = useState<GuildPreview | null>(null)
  const [errorMsg, setErrorMsg] = useState('')

  const load = async () => {
    setPageState('loading')
    const result = await previewInvite(code ?? '')
    if (!result) { setPageState('invalid'); return }
    setGuild(result.guild)
    if (!isAuthenticated || !token) { setPageState('guest'); return }
    const isMember = await checkMembership(result.guild.id, token)
    setPageState(isMember ? 'member' : 'joinable')
  }

  useEffect(() => {
    load()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code, isAuthenticated])

  const handleJoin = async () => {
    if (!token || !guild) return
    setPageState('joining')
    try {
      const result = await joinGuildByInvite(code!, token)
      if (result) {
        setPageState('joined')
        setTimeout(() => navigate(`/channels/${result.guild.id}`), 1500)
      } else {
        setErrorMsg('加入失败，请稍后重试')
        setPageState('error')
      }
    } catch (e: unknown) {
      setErrorMsg(e instanceof Error ? e.message : '加入失败')
      setPageState('error')
    }
  }

  const initial = guild?.name?.[0]?.toUpperCase() ?? '?'

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: 'radial-gradient(ellipse at 60% 20%, #4752c4 0%, #1e1f22 55%, #111214 100%)' }}
    >
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <span className="text-white text-2xl font-bold tracking-tight">💬 Discord</span>
        </div>

        <div className="bg-[#313338] rounded-2xl shadow-2xl p-8">
          {<InviteContent
            pageState={pageState}
            guild={guild}
            initial={initial}
            errorMsg={errorMsg}
            code={code ?? ''}
            onJoin={handleJoin}
            onGoHome={(guildId) => navigate(guildId ? `/channels/${guildId}` : '/')}
          />}
        </div>

        <p className="text-center text-[#b5bac1] text-xs mt-6">
          已有账号？<Link to="/login" className="text-[#00a8fc] hover:underline">登录</Link>
          &nbsp;·&nbsp;
          没有账号？<Link to="/register" className="text-[#00a8fc] hover:underline">注册</Link>
        </p>
      </div>
    </div>
  )
}

interface ContentProps {
  pageState: PageState
  guild: GuildPreview | null
  initial: string
  errorMsg: string
  code: string
  onJoin: () => void
  onGoHome: (guildId?: string) => void
}

function GuildCard({ guild, initial }: { guild: GuildPreview; initial: string }) {
  return (
    <div className="flex items-center gap-4 bg-[#2b2d31] rounded-xl p-4 mb-6 border border-[#3f4147]">
      <div className="w-16 h-16 rounded-2xl bg-[#5865f2] flex items-center justify-center text-white text-2xl font-bold flex-shrink-0 overflow-hidden">
        {guild.icon
          ? <img src={guild.icon} alt={guild.name} className="w-full h-full object-cover" />
          : initial}
      </div>
      <div>
        <p className="text-white font-bold text-lg">{guild.name}</p>
        <p className="text-[#b5bac1] text-sm mt-0.5 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#23a55a] inline-block"></span>
          {guild.member_count} 位成员
        </p>
      </div>
    </div>
  )
}

function InviteContent({ pageState, guild, initial, errorMsg, code, onJoin, onGoHome }: ContentProps) {
  if (pageState === 'loading') {
    return (
      <div className="flex flex-col items-center py-8 gap-4">
        <svg className="animate-spin h-10 w-10 text-[#5865f2]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        <p className="text-[#b5bac1]">正在验证邀请链接...</p>
      </div>
    )
  }

  if (pageState === 'invalid') {
    return (
      <div className="text-center py-6">
        <div className="text-5xl mb-4">🔗</div>
        <h2 className="text-white text-xl font-bold mb-2">邀请链接无效</h2>
        <p className="text-[#b5bac1] text-sm mb-6">
          该邀请链接可能已过期或已达到最大使用次数。<br />请向服务器管理员索取新的邀请链接。
        </p>
        <button
          onClick={() => onGoHome()}
          className="px-6 py-2.5 bg-[#5865f2] hover:bg-[#4752c4] text-white font-semibold rounded-lg transition-colors"
        >
          返回首页
        </button>
      </div>
    )
  }

  if (pageState === 'error') {
    return (
      <div className="text-center py-6">
        <div className="text-5xl mb-4">⚠️</div>
        <h2 className="text-white text-xl font-bold mb-2">加入失败</h2>
        <p className="text-[#f23f43] text-sm mb-6">{errorMsg}</p>
        <button
          onClick={() => onGoHome()}
          className="px-6 py-2.5 bg-[#5865f2] hover:bg-[#4752c4] text-white font-semibold rounded-lg transition-colors"
        >
          返回首页
        </button>
      </div>
    )
  }

  if (pageState === 'joined') {
    return (
      <div className="flex flex-col items-center py-8 gap-4">
        <div className="w-16 h-16 rounded-full bg-[#23a55a] flex items-center justify-center text-3xl text-white">✓</div>
        <p className="text-white font-bold text-lg">成功加入 {guild?.name}！</p>
        <p className="text-[#b5bac1] text-sm">正在跳转...</p>
      </div>
    )
  }

  if (pageState === 'guest') {
    return (
      <>
        <h2 className="text-white text-xl font-bold text-center mb-2">你收到了邀请！</h2>
        <p className="text-[#b5bac1] text-sm text-center mb-6">加入这个服务器并开始聊天</p>
        {guild && <GuildCard guild={guild} initial={initial} />}
        <div className="space-y-3">
          <Link
            to={`/register?invite=${code}`}
            className="block w-full text-center py-3 bg-[#5865f2] hover:bg-[#4752c4] text-white font-semibold rounded-lg transition-colors"
          >
            注册账号并加入
          </Link>
          <Link
            to={`/login?invite=${code}`}
            className="block w-full text-center py-3 bg-[#4e5058] hover:bg-[#3f4147] text-white font-semibold rounded-lg transition-colors"
          >
            已有账号，登录加入
          </Link>
        </div>
        <p className="text-[#b5bac1] text-xs text-center mt-4">
          邀请码：<span className="font-mono text-white">{code}</span>
        </p>
      </>
    )
  }

  if (pageState === 'member') {
    return (
      <>
        <h2 className="text-white text-xl font-bold text-center mb-2">你已经在这个服务器里了！</h2>
        <p className="text-[#b5bac1] text-sm text-center mb-6">点击下方按钮直接进入服务器</p>
        {guild && <GuildCard guild={guild} initial={initial} />}
        <button
          onClick={() => onGoHome(guild?.id)}
          className="w-full py-3 bg-[#23a55a] hover:bg-[#1a8a48] text-white font-semibold rounded-lg transition-colors"
        >
          进入服务器
        </button>
      </>
    )
  }

  // joinable / joining
  return (
    <>
      <h2 className="text-white text-xl font-bold text-center mb-2">你收到了邀请！</h2>
      <p className="text-[#b5bac1] text-sm text-center mb-6">加入这个服务器并开始聊天</p>
      {guild && <GuildCard guild={guild} initial={initial} />}
      <button
        onClick={onJoin}
        disabled={pageState === 'joining'}
        className="w-full py-3 bg-[#23a55a] hover:bg-[#1a8a48] disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
      >
        {pageState === 'joining' && (
          <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        )}
        {pageState === 'joining' ? '加入中...' : '加入服务器'}
      </button>
      <p className="text-[#b5bac1] text-xs text-center mt-4">
        邀请码：<span className="font-mono text-white">{code}</span>
      </p>
    </>
  )
}
