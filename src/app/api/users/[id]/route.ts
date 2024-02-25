import { NextResponse } from 'next/server'

// Services
import { getFiles } from '@/lib/services'

export async function GET (req: any, { params }: { params: { id: string } }): Promise<NextResponse> {
  const { id } = params
  const files = await getFiles(id)
  return NextResponse.json(files)
}

export async function DELETE (req: any, { params }: { params: { id: string } }): Promise<NextResponse> {
  const { id } = params
  const files = await getFiles(id)
  return NextResponse.json(files)
}
