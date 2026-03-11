import { create } from 'zustand'
import { v4 as uuidv4 } from 'uuid'

export interface User {
  id: string
  username: string
  avatar: string
  discriminator: string
}

interface UserState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  login: (username?: string, password?: string) => Promise<boolean>
  logout: () => void
}

const DEMO_USERS = [
  { username: '甲', password: 'password123', email: 'jia@test.com' },
  { username: '乙', password: 'password123', email: 'yi@test.com' },
  { username: '丙', password: 'password123', email: 'bing@test.com' },
]

const API_BASE = '/api'

export const useUserStore = create<UserState>()((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,

  login: async (username?: string, _password?: string) => {
    let selectedUser: { username: string; password: string; email: string }

    if (username) {
      selectedUser = DEMO_USERS.find(u => u.username === username) || DEMO_USERS[0]
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
        const data = await response.json()
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
        return true
      } else {
        console.error('Login failed:', await response.text())
        const existingUser = {
          id: uuidv4(),
          username: selectedUser.username,
          avatar: '',
          discriminator: '0001',
        }
        set({
          isAuthenticated: true,
          user: existingUser,
          token: null,
        })
        return true
      }
    } catch (error) {
      console.error('Login error:', error)
      const existingUser = {
        id: uuidv4(),
        username: selectedUser.username,
        avatar: '',
        discriminator: '0001',
      }
      set({
        isAuthenticated: true,
        user: existingUser,
        token: null,
      })
      return true
    }
  },

  logout: () => {
    set({ user: null, token: null, isAuthenticated: false })
  },
}))

export { DEMO_USERS }
