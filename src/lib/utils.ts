import { toast } from 'react-toastify'

export function formatToKB (size: number): number {
  return size / 1024
}

export function generateRandomPath (fileName?: string): string {
  const name = String(fileName).slice(0, 4)
  const currentDate = new Date().getTime().toString().slice(-2)
  const randomUUID = crypto.randomUUID().split('-')[0]
  const uuid = fileName != null ? `${name}${randomUUID}${currentDate}` : `${randomUUID}${currentDate}`
  return uuid
}

export function generateSecret (): string {
  const randomUUID = crypto.randomUUID()
  const currentDate = new Date().getTime().toString()
  const secret = `${randomUUID}${currentDate}`
  return secret
}

export function showNotification (message: string, type: string): void {
  type === 'success'
    ? toast.success(message, {
      position: 'bottom-right',
      autoClose: 2000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true
    })
    : toast.error(message, {
      position: 'bottom-right',
      autoClose: 2000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true
    })
}
