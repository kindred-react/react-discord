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
  isAuthenticated: boolean
  login: () => void
  logout: () => void
}

export const useUserStore = create<UserState>()((set) => ({
  user: null,
  isAuthenticated: false,
  login: () => {
    set({
      isAuthenticated: true,
      user: {
        id: uuidv4(),
        username: 'Kindred',
        avatar: '',
        discriminator: '0001',
      },
    })
  },
  logout: () => {
    set({ user: null, isAuthenticated: false })
  },
}))
