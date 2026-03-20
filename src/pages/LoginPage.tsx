import { useState, useEffect } from 'react'
import { useNavigate, Link, useSearchParams } from 'react-router-dom'
import { useUserStore, DEMO_USERS } from '../shared/stores/userStore'

type LoginError = '' | 'empty' | 'network' | 'server' | 'invalid'

export function LoginPage() {
  const login = useUserStore((state) => state.login)
  const isAuthenticated = useUserStore((state) => state.isAuthenticated)
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const inviteCode = searchParams.get('invite')

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
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
    <div className="min-h-screen flex items-center justify-center bg-[#313338]">
      <div className="bg-[#2b2d31] p-8 rounded-lg shadow-xl w-[480px]">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-white mb-2">欢迎回来</h1>
          <p className="text-[#949ba4]">我们很高兴再次见到你!</p>
        </div>

        <div className="space-y-4 mb-6">
          <div>
            <label className="text-sm text-[#949ba4] mb-2 block">邮箱</label>
            <input
              type="email"
              value={email}
              onChange={(e) => handleEmailChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="请输入邮箱"
              className={`w-full bg-[#1e1f22] text-white py-2.5 px-3 rounded-md border ${
                errorType === 'invalid' || errorType === 'empty'
                  ? 'border-[#da373c] focus:border-[#da373c]'
                  : 'border-[#1e1f22] focus:border-[#5865f2]'
              } focus:outline-none placeholder-[#949ba4] transition-colors`}
            />
          </div>
          <div>
            <label className="text-sm text-[#949ba4] mb-2 block">密码</label>
            <input
              type="password"
              value={password}
              onChange={(e) => handlePasswordChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="请输入密码"
              className={`w-full bg-[#1e1f22] text-white py-2.5 px-3 rounded-md border ${
                errorType === 'invalid' || errorType === 'empty'
                  ? 'border-[#da373c] focus:border-[#da373c]'
                  : 'border-[#1e1f22] focus:border-[#5865f2]'
              } focus:outline-none placeholder-[#949ba4] transition-colors`}
            />
          </div>
        </div>

        {errorType && (
          <div className="mb-4 p-3 bg-[#da373c]/10 border border-[#da373c] rounded-md">
            <p className="text-[#da373c] text-sm font-medium">
              {errorType === 'empty' && '请输入邮箱和密码'}
              {errorType === 'invalid' && '邮箱或密码错误，请重新输入'}
              {errorType === 'network' && '网络连接失败，请检查网络后重试'}
              {errorType === 'server' && '服务器错误，请稍后重试'}
            </p>
          </div>
        )}

        <div className="mb-6">
          <label className="text-sm text-[#949ba4] mb-2 block">快速选择测试账号:</label>
          <div className="flex gap-2">
            {DEMO_USERS.map((user, index) => (
              <button
                key={index}
                onClick={() => handleSelectUser(index)}
                className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all ${
                  email === user.email
                    ? 'bg-[#5865f2] text-white shadow-lg shadow-[#5865f2]'
                    : 'bg-[#1e1f22] text-[#949ba4] hover:bg-[#35373c]'
                }`}
              >
                {user.username}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleLogin}
          disabled={isLoading}
          className="w-full bg-[#5865f2] hover:bg-[#4752c4] active:bg-[#3c51b8] text-white font-medium py-3 px-4 rounded-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>登录中...</span>
            </>
          ) : (
            '登录'
          )}
        </button>

        <p className="text-xs text-[#949ba4] mt-4 text-center">
          需要账号?{' '}
          <Link to="/register" className="text-[#00a8fc] hover:underline">
            立即注册
          </Link>
        </p>
      </div>
    </div>
  )
}
