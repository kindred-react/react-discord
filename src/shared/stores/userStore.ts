import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User, AuthResponse } from '../types'

interface UserState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isVerifying: boolean
  login: (email?: string, password?: string) => Promise<boolean>
  logout: () => void
  setUser: (user: User) => void
  setToken: (token: string) => void
  verifyToken: () => Promise<boolean>
  startTokenVerification: () => void
  stopTokenVerification: () => void
}

const DEMO_USERS = [
  { username: '甲', password: 'password123', email: 'jia@test.com' },
  { username: '乙', password: 'password123', email: 'yi@test.com' },
  { username: '丙', password: 'password123', email: 'bing@test.com' },
]

const API_BASE = '/api'
const TOKEN_VERIFY_INTERVAL = 5 * 60 * 1000
let verificationInterval: ReturnType<typeof setInterval> | null = null

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isVerifying: false,

      login: async (email?: string, password?: string) => {
        let selectedUser: { username: string; password: string; email: string }

        if (email && password) {
          selectedUser = { username: email.split('@')[0], email, password }
        } else if (email) {
          selectedUser = DEMO_USERS.find(u => u.username === email || u.email === email) || DEMO_USERS[0]
        } else {
          selectedUser = DEMO_USERS[0]
        }

        try {
          const response = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: selectedUser.email,
              password: selectedUser.password,
            }),
          })

          if (response.ok) {
            const data: AuthResponse = await response.json()
            set({
              isAuthenticated: true,
              user: {
                id: data.user.id,
                username: data.user.username,
                avatar: data.user.avatar || '',
                discriminator: data.user.discriminator || '0001',
              },
              token: data.token,
            })
            get().startTokenVerification()
            return true
          } else {
            console.error('Login failed:', await response.text())
            return false
          }
        } catch (error) {
          console.error('Login error:', error)
          return false
        }
      },

      logout: () => {
        get().stopTokenVerification()
        set({ user: null, token: null, isAuthenticated: false })
      },

      setUser: (user) => set({ user }),
      setToken: (token) => set({ token }),

      verifyToken: async () => {
        const token = get().token
        if (!token) {
          get().logout()
          return false
        }

        set({ isVerifying: true })

        try {
          const response = await fetch(`${API_BASE}/auth/me`, {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          })

          set({ isVerifying: false })

          if (response.ok) {
            const userData: User = await response.json()
            set({ user: userData, isAuthenticated: true })
            return true
          } else {
            console.warn('Token verification failed (401), logging out')
            get().logout()
            return false
          }
        } catch (error) {
          set({ isVerifying: false })
          console.error('Token verification error:', error)
          get().logout()
          return false
        }
      },

      startTokenVerification: () => {
        if (verificationInterval) {
          clearInterval(verificationInterval)
        }
        verificationInterval = setInterval(() => {
          get().verifyToken()
        }, TOKEN_VERIFY_INTERVAL)
      },

      stopTokenVerification: () => {
        if (verificationInterval) {
          clearInterval(verificationInterval)
          verificationInterval = null
        }
      },
    }),
    {
      name: 'user-storage',
      onRehydrateStorage: () => (state) => {
        if (state?.token) {
          state.verifyToken()
        }
      },
    }
  )
)

export { DEMO_USERS }
