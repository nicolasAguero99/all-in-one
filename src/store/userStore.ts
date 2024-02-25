import { createWithEqualityFn } from 'zustand/traditional'

// Types
import { type UserStore } from '@/types/types'

export const userStore = createWithEqualityFn<UserStore>((set) => ({
  user: {
    uid: '',
    name: '',
    email: '',
    photo: ''
  },
  tokens: 0,
  setUser: (user) => { set({ user }) },
  setTokens: (tokens) => { set({ tokens }) }
}))
