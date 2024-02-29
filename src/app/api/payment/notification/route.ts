import { type NextRequest, NextResponse } from 'next/server'
import MercadoPagoConfig, { Payment } from 'mercadopago'
import { doc, getDoc, updateDoc } from 'firebase/firestore'

// Constants
import { MERCADO_PAGO_API_KEY } from '@/constants/constants'

// Lib
import { db } from '@/lib/firebase'

export async function POST (request: NextRequest, res: Response): Promise<NextResponse> {
  const body = await request.json().then((data) => data)
  const client = new MercadoPagoConfig({ accessToken: String(MERCADO_PAGO_API_KEY) })
  const payment = await new Payment(client).get({ id: body.data.id })
  const status = payment.api_response.status
  const rawExternalReference = payment.external_reference
  const externalReference = String(rawExternalReference).split('_._')

  const getSecret: string = externalReference[0]
  const userId: string = externalReference[1]

  // Add the tokens to user
  const userRef = doc(db, 'users', userId)
  const userSnap = await getDoc(userRef)
  if (!userSnap.exists()) return NextResponse.json({ success: false }, { status: 404 })
  const { tokens, secret } = userSnap.data()
  if (secret !== getSecret) {
    return NextResponse.json({ success: false }, { status: 401 })
  }
  const { quantity }: { quantity: string } = payment.additional_info?.items?.[0] as any

  const tokensRes = Number(tokens) + Number(quantity)

  await updateDoc(userRef, {
    tokens: tokensRes,
    secret: ''
  })

  return NextResponse.json({ payment, status })
}
