export interface FileData {
  createdAt: string
  fileURL: string
  name: string
  type: string
  size: number
  link: string
  fileName: string
}

export interface UserData {
  uid: string
  email: string
  name: string
  photo: string
}

export interface UserStore {
  user: UserData
  tokens: number
  setUser: (user: UserData) => void
  setTokens: (tokens: number) => void
}

export interface ErrorStore {
  error: string
  setError: (error: string) => void
}

export enum TypesServices {
  URL = 'URL',
  FILE = 'FILE',
}
