import MercadoPagoConfig, { Preference } from 'mercadopago'
import { NextResponse } from 'next/server'
import { doc, getDoc, updateDoc } from 'firebase/firestore'

// Constants
import { MERCADO_PAGO_API_KEY } from '@/constants/constants'

// Utils
import { generateSecret } from '@/lib/utils'

// Lib
import { db } from '@/lib/firebase'

export async function POST (req: Request, res: Response): Promise<NextResponse> {
  const client = new MercadoPagoConfig({ accessToken: String(MERCADO_PAGO_API_KEY) })
  const { userId }: { userId: string } = await req.json()
  const secret = generateSecret()
  const userRef = doc(db, 'users', userId)
  const userSnap = await getDoc(userRef)
  if (!userSnap.exists()) return NextResponse.json({ success: false }, { status: 404 })
  await updateDoc(userRef, {
    secret
  })
  const externalReference = `${secret}_._${userId}`

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
        success: 'http://localhost:3000/?success',
        failure: 'http://localhost:3000/?failure',
        pending: 'http://localhost:3000/?pending'
      },
      auto_return: 'approved',
      external_reference: externalReference
    }
  })

  return NextResponse.json(preference.sandbox_init_point)
}
