import { NextResponse } from 'next/server'

// Services
import { getTokensByUser } from '@/lib/services'

export async function GET (req: any, { params }: { params: { id: string } }): Promise<NextResponse> {
  const { id } = params
  const tokens = await getTokensByUser(id)

  return NextResponse.json(tokens)
}
