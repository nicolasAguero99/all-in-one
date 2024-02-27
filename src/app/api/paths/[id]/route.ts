import { NextResponse } from 'next/server'

// Services
import { deleteFile } from '@/lib/services'

export async function DELETE (req: any, { params }: { params: { id: string } }): Promise<NextResponse> {
  const { id } = params
  const { userId, fileName, type }: { userId: string, fileName: string, type: string } = await req.json()
  await deleteFile(id, userId, fileName, type)
  return NextResponse.json({ success: true, status: 200 })
}
