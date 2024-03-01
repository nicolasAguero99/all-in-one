import { NextResponse } from 'next/server'

// Services
import { deleteUrl, getUrls } from '@/lib/services'

export async function GET (req: any, { params }: { params: { id: string } }): Promise<NextResponse> {
  const { id } = params
  const files = await getUrls(id)

  return NextResponse.json(files)
}

export async function DELETE (req: any, { params }: { params: { id: string } }): Promise<NextResponse> {
  const { id } = params
  const { userId }: { userId: string } = await req.json()
  const data = await deleteUrl(id, userId)

  return NextResponse.json(data)
}
