import { NextResponse } from 'next/server'

// Services
import { getUrls } from '@/lib/services'

export async function GET (req: any, { params }: { params: { id: string } }): Promise<NextResponse> {
  const { id } = params
  const files = await getUrls(id)

  return NextResponse.json(files)
}
