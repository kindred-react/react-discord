import { useNavigate } from 'react-router-dom'
import { useUserStore } from '../stores/userStore'

export function LoginPage() {
  const login = useUserStore((state) => state.login)
  const navigate = useNavigate()

  const handleLogin = () => {
    login()
    navigate('/')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#313338]">
      <div className="bg-[#2b2d31] p-8 rounded-lg shadow-xl w-[480px]">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-white mb-2">欢迎回来</h1>
          <p className="text-[#949ba4]">我们很高兴再次见到你!</p>
        </div>

        <button
          onClick={handleLogin}
          className="w-full bg-[#5865f2] hover:bg-[#4752c4] text-white font-medium py-3 px-4 rounded-md transition-colors duration-200"
        >
          登录
        </button>

        <p className="text-xs text-[#949ba4] mt-4 text-center">
          需要账号? <span className="text-[#00a8fc] hover:underline cursor-pointer">注册</span>
        </p>
      </div>
    </div>
  )
}
