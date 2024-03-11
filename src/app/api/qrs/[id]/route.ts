import { NextResponse } from 'next/server'

// Services
import { deleteQr } from '@/lib/services'

export async function DELETE (req: any, { params }: { params: { id: string } }): Promise<NextResponse> {
  const { id } = params
  const { userId }: { userId: string } = await req.json()
  const data = await deleteQr(id, userId)

  return NextResponse.json(data)
}
