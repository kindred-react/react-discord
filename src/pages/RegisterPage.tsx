import { useState, useEffect } from 'react'
import { useNavigate, Link, useSearchParams } from 'react-router-dom'
import { useUserStore } from '../shared/stores/userStore'

type RegisterError = '' | 'empty' | 'network' | 'server' | 'conflict_username' | 'conflict_email' | 'password_short' | 'invalid_email'

const API_BASE = '/api'

export function RegisterPage() {
  const isAuthenticated = useUserStore((state) => state.isAuthenticated)
  const startTokenVerification = useUserStore((state) => state.startTokenVerification)
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const inviteCode = searchParams.get('invite')

  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [errorType, setErrorType] = useState<RegisterError>('')
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    if (isAuthenticated) {
      navigate(inviteCode ? `/invite/${inviteCode}` : '/', { replace: true })
    }
  }, [isAuthenticated, navigate, inviteCode])

  const clearError = () => {
    if (errorType) {
      setErrorType('')
      setErrorMessage('')
    }
  }

  const handleRegister = async () => {
    if (!username.trim() || !email.trim() || !password.trim()) {
      setErrorType('empty')
      return
    }
    if (password.length < 6) {
      setErrorType('password_short')
      return
    }

    setIsLoading(true)
    setErrorType('')
    setErrorMessage('')

    try {
      const response = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password }),
      })

      const data = await response.json()

      if (response.ok) {
        // Registration successful — set all auth state atomically
        useUserStore.setState({
          isAuthenticated: true,
          token: data.token,
          user: {
            id: data.user.id,
            username: data.user.username,
            avatar: data.user.avatar ?? '',
            discriminator: data.user.discriminator ?? '0001',
          },
        })
        startTokenVerification()
        navigate('/')
      } else if (response.status === 409) {
        const msg: string = data.error ?? ''
        if (msg.toLowerCase().includes('username')) {
          setErrorType('conflict_username')
        } else {
          setErrorType('conflict_email')
        }
      } else if (response.status === 400) {
        setErrorType('server')
        setErrorMessage(data.error ?? '请求参数有误')
      } else {
        setErrorType('server')
        setErrorMessage(data.error ?? '服务器错误，请稍后重试')
      }
    } catch (err) {
      if (err instanceof TypeError && err.message.includes('fetch')) {
        setErrorType('network')
      } else {
        setErrorType('server')
        setErrorMessage('未知错误，请稍后重试')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isLoading) {
      handleRegister()
    }
  }

  const errorText = () => {
    switch (errorType) {
      case 'empty': return '请填写所有字段'
      case 'password_short': return '密码至少需要6位'
      case 'conflict_username': return '该用户名已被使用'
      case 'conflict_email': return '该邮箱已被注册'
      case 'network': return '网络连接失败，请检查网络后重试'
      case 'server': return errorMessage || '服务器错误，请稍后重试'
      default: return ''
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#313338]">
      <div className="bg-[#2b2d31] p-8 rounded-lg shadow-xl w-[480px]">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-white mb-2">创建账号</h1>
          <p className="text-[#949ba4]">加入我们，开始聊天吧!</p>
        </div>

        <div className="space-y-4 mb-6">
          <div>
            <label className="text-xs font-bold text-[#949ba4] uppercase tracking-wide mb-2 block">
              用户名 <span className="text-[#da373c]">*</span>
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => { setUsername(e.target.value); clearError() }}
              onKeyDown={handleKeyDown}
              placeholder="请输入用户名 (2-32位)"
              maxLength={32}
              className={`w-full bg-[#1e1f22] text-white py-2.5 px-3 rounded-md border ${
                errorType === 'conflict_username'
                  ? 'border-[#da373c]'
                  : 'border-[#1e1f22] focus:border-[#5865f2]'
              } focus:outline-none placeholder-[#949ba4] transition-colors`}
            />
          </div>
          <div>
            <label className="text-xs font-bold text-[#949ba4] uppercase tracking-wide mb-2 block">
              邮箱 <span className="text-[#da373c]">*</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); clearError() }}
              onKeyDown={handleKeyDown}
              placeholder="请输入邮箱"
              className={`w-full bg-[#1e1f22] text-white py-2.5 px-3 rounded-md border ${
                errorType === 'conflict_email'
                  ? 'border-[#da373c]'
                  : 'border-[#1e1f22] focus:border-[#5865f2]'
              } focus:outline-none placeholder-[#949ba4] transition-colors`}
            />
          </div>
          <div>
            <label className="text-xs font-bold text-[#949ba4] uppercase tracking-wide mb-2 block">
              密码 <span className="text-[#da373c]">*</span>
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); clearError() }}
              onKeyDown={handleKeyDown}
              placeholder="请输入密码 (至少6位)"
              className={`w-full bg-[#1e1f22] text-white py-2.5 px-3 rounded-md border ${
                errorType === 'password_short'
                  ? 'border-[#da373c]'
                  : 'border-[#1e1f22] focus:border-[#5865f2]'
              } focus:outline-none placeholder-[#949ba4] transition-colors`}
            />
          </div>
        </div>

        {errorType && (
          <div className="mb-4 p-3 bg-[#da373c]/10 border border-[#da373c] rounded-md">
            <p className="text-[#da373c] text-sm font-medium">{errorText()}</p>
          </div>
        )}

        <button
          onClick={handleRegister}
          disabled={isLoading}
          className="w-full bg-[#5865f2] hover:bg-[#4752c4] active:bg-[#3c51b8] text-white font-medium py-3 px-4 rounded-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>注册中...</span>
            </>
          ) : (
            '注册'
          )}
        </button>

        <p className="text-xs text-[#949ba4] mt-4 text-center">
          已有账号?{' '}
          <Link to="/login" className="text-[#00a8fc] hover:underline">
            立即登录
          </Link>
        </p>
      </div>
    </div>
  )
}
