import { createWithEqualityFn } from 'zustand/traditional'

// Types
import { type ErrorStore } from '@/types/types'

export const errorStore = createWithEqualityFn<ErrorStore>((set) => ({
  error: '',
  setError: (error) => { set({ error }) }
}))
