export const API_URL = process.env.NEXT_PUBLIC_API_URL
export const MERCADO_PAGO_API_KEY = process.env.MERCADO_PAGO_PUBLIC_KEY
export const PAYMENT_STATUS = ['success', 'failure', 'pending'] as const
export const SERVICES_DATA = [{ name: 'Url', value: 'shortener' }, { name: 'File', value: 'file' }, { name: 'QR', value: 'qr' }] as const
export const TOKEN_PRICE = 100
