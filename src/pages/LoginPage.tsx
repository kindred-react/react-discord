import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUserStore, DEMO_USERS } from '../stores/userStore'

export function LoginPage() {
  const login = useUserStore((state) => state.login)
  const navigate = useNavigate()
  const [selectedUser, setSelectedUser] = useState(0)
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = async () => {
    setIsLoading(true)
    const user = DEMO_USERS[selectedUser]
    await login(user.username, user.password)
    setIsLoading(false)
    navigate('/')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#313338]">
      <div className="bg-[#2b2d31] p-8 rounded-lg shadow-xl w-[480px]">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-white mb-2">欢迎回来</h1>
          <p className="text-[#949ba4]">我们很高兴再次见到你!</p>
        </div>

        <div className="mb-4">
          <label className="text-sm text-[#949ba4] mb-2 block">选择测试账号:</label>
          <div className="flex gap-2">
            {DEMO_USERS.map((user, index) => (
              <button
                key={index}
                onClick={() => setSelectedUser(index)}
                className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                  selectedUser === index
                    ? 'bg-[#5865f2] text-white'
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
          className="w-full bg-[#5865f2] hover:bg-[#4752c4] text-white font-medium py-3 px-4 rounded-md transition-colors duration-200 disabled:opacity-50"
        >
          {isLoading ? '登录中...' : '登录'}
        </button>

        <p className="text-xs text-[#949ba4] mt-4 text-center">
          需要账号? <span className="text-[#00a8fc] hover:underline cursor-pointer">注册</span>
        </p>
      </div>
    </div>
  )
}
