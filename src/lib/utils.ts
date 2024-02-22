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
