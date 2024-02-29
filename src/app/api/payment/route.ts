import MercadoPagoConfig, { Preference } from 'mercadopago'
import { NextResponse } from 'next/server'
import { doc, getDoc, updateDoc } from 'firebase/firestore'

// Constants
import { MERCADO_PAGO_API_KEY, TOKEN_PRICE } from '@/constants/constants'

// Utils
import { generateSecret } from '@/lib/utils'

// Lib
import { db } from '@/lib/firebase'

export async function POST (req: Request, res: Response): Promise<NextResponse> {
  const client = new MercadoPagoConfig({ accessToken: String(MERCADO_PAGO_API_KEY) })
  const { userId, quantity }: { userId: string, quantity: number } = await req.json()

  const secret = generateSecret()
  const userRef = doc(db, 'users', userId)
  const userSnap = await getDoc(userRef)
  if (!userSnap.exists()) return NextResponse.json({ success: false }, { status: 404 })
  await updateDoc(userRef, {
    secret
  })
  const externalReference = `${secret}_._${userId}`
  const title = quantity === 1 ? `Compra de ${quantity} token` : `Compra de ${quantity} tokens`

  const preference = await new Preference(client).create({
    body: {
      items: [
        {
          id: 'tokenPago',
          title,
          unit_price: TOKEN_PRICE,
          quantity
        }
      ],
      back_urls: {
        success: 'http://localhost:3000/?paymentStatus=success',
        failure: 'http://localhost:3000/?paymentStatus=failure',
        pending: 'http://localhost:3000/?paymentStatus=pending'
      },
      auto_return: 'approved',
      external_reference: externalReference
    }
  })

  return NextResponse.json(preference.sandbox_init_point)
}
