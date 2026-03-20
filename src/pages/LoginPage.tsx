import { useState, useEffect } from 'react'
import { useNavigate, Link, useSearchParams } from 'react-router-dom'
import { useUserStore, DEMO_USERS } from '../shared/stores/userStore'
import { Eye, EyeOff } from 'lucide-react'

type LoginError = '' | 'empty' | 'network' | 'server' | 'invalid'

export function LoginPage() {
  const login = useUserStore((state) => state.login)
  const isAuthenticated = useUserStore((state) => state.isAuthenticated)
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const inviteCode = searchParams.get('invite')

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errorType, setErrorType] = useState<LoginError>('')

  useEffect(() => {
    if (isAuthenticated) {
      navigate(inviteCode ? `/invite/${inviteCode}` : '/', { replace: true })
    }
  }, [isAuthenticated, navigate, inviteCode])

  const handleSelectUser = (index: number) => {
    const user = DEMO_USERS[index]
    setEmail(user.email)
    setPassword(user.password)
    setErrorType('')
  }

  const handleEmailChange = (value: string) => {
    setEmail(value)
    if (errorType) setErrorType('')
  }

  const handlePasswordChange = (value: string) => {
    setPassword(value)
    if (errorType) setErrorType('')
  }

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setErrorType('empty')
      return
    }
    setIsLoading(true)
    setErrorType('')
    
    try {
      const success = await login(email, password)
      setIsLoading(false)
      if (success) {
        navigate(inviteCode ? `/invite/${inviteCode}` : '/')
      } else {
        setErrorType('invalid')
      }
    } catch (err) {
      setIsLoading(false)
      if (err instanceof TypeError && err.message.includes('fetch')) {
        setErrorType('network')
      } else {
        setErrorType('server')
      }
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isLoading) {
      handleLogin()
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #5865f2 0%, #4752c4 50%, #3c45a5 100%)' }}>
      <div className="bg-[#313338] rounded-[4px] shadow-2xl flex overflow-hidden" style={{ width: 784, minHeight: 400 }}>
        {/* Left: form */}
        <div className="flex-1 px-10 py-9">
          <div className="text-center mb-5">
            <h1 className="text-2xl font-bold text-white">欢迎回来！</h1>
            <p className="text-[#949ba4] mt-1">很高兴再次见到你！</p>
          </div>

          <div className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-[#b5bac1] uppercase tracking-wide mb-2">电子邮件 <span className="text-[#f23f43]">*</span></label>
              <input
                type="email"
                value={email}
                onChange={(e) => handleEmailChange(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder=""
                className={`w-full bg-[#1e1f22] text-white py-2.5 px-3 rounded-[3px] text-base outline-none border ${
                  errorType === 'invalid' || errorType === 'empty' ? 'border-[#f23f43]' : 'border-transparent focus:border-[#5865f2]'
                } transition-colors`}
                autoComplete="email"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-[#b5bac1] uppercase tracking-wide">密码 <span className="text-[#f23f43]">*</span></label>
                <button type="button" className="text-[#00a8fc] text-xs hover:underline">忘记密码？</button>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => handlePasswordChange(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className={`w-full bg-[#1e1f22] text-white py-2.5 px-3 pr-10 rounded-[3px] text-base outline-none border ${
                    errorType === 'invalid' || errorType === 'empty' ? 'border-[#f23f43]' : 'border-transparent focus:border-[#5865f2]'
                  } transition-colors`}
                  autoComplete="current-password"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#949ba4] hover:text-[#dbdee1] transition-colors">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
          </div>

          {errorType && (
            <p className="text-[#f23f43] text-xs mt-2">
              {errorType === 'empty' && '请输入邮箱和密码'}
              {errorType === 'invalid' && '邮箱或密码不正确。'}
              {errorType === 'network' && '网络连接失败，请检查网络后重试'}
              {errorType === 'server' && '服务器错误，请稍后重试'}
            </p>
          )}

          <button
            onClick={handleLogin}
            disabled={isLoading}
            className="w-full mt-5 bg-[#5865f2] hover:bg-[#4752c4] active:bg-[#3c45a5] text-white font-medium py-[10px] rounded-[3px] text-base transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                登录中...
              </>
            ) : '登录'}
          </button>

          <p className="text-[#949ba4] text-sm mt-4">
            需要账号？<Link to={inviteCode ? `/register?invite=${inviteCode}` : '/register'} className="text-[#00a8fc] hover:underline">立即注册</Link>
          </p>

          <div className="mt-6 pt-5 border-t border-[#3f4147]">
            <p className="text-xs text-[#949ba4] mb-2">快速选择测试账号</p>
            <div className="flex gap-2">
              {DEMO_USERS.map((user, index) => (
                <button key={index} onClick={() => handleSelectUser(index)}
                  className={`flex-1 py-1.5 px-2 rounded-[3px] text-xs font-medium transition-colors ${
                    email === user.email ? 'bg-[#5865f2] text-white' : 'bg-[#1e1f22] text-[#949ba4] hover:bg-[#35373c] hover:text-white'
                  }`}
                >{user.username}</button>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Discord branding */}
        <div className="w-[340px] bg-[#5865f2] flex flex-col items-center justify-center px-8 py-9 flex-shrink-0 relative overflow-hidden">
          <div className="absolute inset-0" style={{ background: 'radial-gradient(circle at 70% 20%, rgba(255,255,255,0.15) 0%, transparent 60%)' }} />
          <div className="relative z-10 text-center">
            <svg width="60" height="60" viewBox="0 0 71 80" fill="white" className="mx-auto mb-5">
              <path d="M60.1 8.4A58.5 58.5 0 0046.7 4.5a.2.2 0 00-.3.1 40.5 40.5 0 00-1.8 3.7 54 54 0 00-16.2 0A37.6 37.6 0 0026.6 4.6a.2.2 0 00-.3-.1A58.3 58.3 0 0012.9 8.4a.2.2 0 00-.1.1C1.9 24.3-1.1 39.8.4 55.1a.2.2 0 00.1.2 58.8 58.8 0 0017.7 8.9.2.2 0 00.3-.1 42 42 0 003.6-5.9.2.2 0 00-.1-.3 38.7 38.7 0 01-5.5-2.6.2.2 0 010-.4c.4-.3.7-.5 1.1-.8a.2.2 0 01.2 0c11.5 5.3 24 5.3 35.4 0a.2.2 0 01.2 0l1.1.8a.2.2 0 010 .4 36.1 36.1 0 01-5.5 2.6.2.2 0 00-.1.3 47 47 0 003.6 5.9.2.2 0 00.3.1 58.6 58.6 0 0017.8-8.9.2.2 0 00.1-.2c1.8-18.2-3-33.5-12.7-47.4a.2.2 0 00-.1-.1zM23.7 45.6c-3.5 0-6.4-3.2-6.4-7.1s2.8-7.1 6.4-7.1c3.6 0 6.5 3.2 6.4 7.1 0 3.9-2.8 7.1-6.4 7.1zm23.7 0c-3.5 0-6.4-3.2-6.4-7.1s2.8-7.1 6.4-7.1c3.6 0 6.5 3.2 6.4 7.1 0 3.9-2.8 7.1-6.4 7.1z" />
            </svg>
            <h2 className="text-white text-[22px] font-bold leading-snug mb-3">欢迎加入 Discord</h2>
            <p className="text-white/75 text-sm leading-relaxed">和你的朋友、社区一起聊天、语音、视频，随时随地保持联系。</p>
          </div>
        </div>
      </div>
    </div>
  )
}
