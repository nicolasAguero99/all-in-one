import { toast } from 'react-toastify'

export function formatToKB (size: number): number {
  return size / 1024
}

export function filesSizesToKb (bytes: number): number {
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  const sizeFormatted = parseFloat((bytes / Math.pow(1024, i)).toFixed(0))
  return sizeFormatted
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

export const urlNoSpacesCheck = (input: string): boolean => {
  return !/\s/.test(input) && !/\s/.test(input.trim()) as boolean
}

export const formattedDate = (date: string): string[] => {
  const dividedDate = new Date(date).toLocaleDateString('es-AR', { year: 'numeric', month: 'short', day: 'numeric' }).split(' ')
  const day = dividedDate[0].padStart(2, '0')
  const month = dividedDate[2]
  // const year = dividedDate[4]
  return [day, month]
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
