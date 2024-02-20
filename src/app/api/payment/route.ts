import MercadoPagoConfig, { Preference } from 'mercadopago'
import { NextResponse } from 'next/server'

// Constants
import { MERCADO_PAGO_API_KEY } from '@/constants/constants'

export async function POST (req: Request, res: Response): Promise<NextResponse> {
  console.log('MERCADO_PAGO_API_KEY', MERCADO_PAGO_API_KEY)
  console.log('process.env.MERCADO_PAGO_PUBLIC_KEY', process.env.MERCADO_PAGO_PUBLIC_KEY)
  console.log('process.env.NEXT_PUBLIC_API_URL', process.env.NEXT_PUBLIC_API_URL)
  const client = new MercadoPagoConfig({ accessToken: String(MERCADO_PAGO_API_KEY) })
  const preference = await new Preference(client).create({
    body: {
      items: [
        {
          id: 'tokenPago',
          title: 'Compra de tokens',
          unit_price: 1000,
          quantity: 1
        }
      ],
      back_urls: {
        success: 'http://localhost:3000/',
        failure: 'http://localhost:3000/failure',
        pending: 'http://localhost:3000/pending'
      },
      auto_return: 'approved'
    }
  })

  console.log('preference', preference)

  return NextResponse.json(preference.sandbox_init_point)
}
