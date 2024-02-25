import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'

// Services
import { deleteFile } from '@/lib/services'

export async function DELETE (req: any, { params }: { params: { id: string } }): Promise<NextResponse> {
  const { id } = params
  const { userId, fileName }: { userId: string, fileName: string } = await req.json()
  await deleteFile(id, userId, fileName)
  revalidatePath('/files')
  return NextResponse.json({ success: true, status: 200 })
}
