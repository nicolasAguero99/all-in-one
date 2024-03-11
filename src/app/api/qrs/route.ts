import { NextResponse } from 'next/server'

// Services
import { addQrs } from '@/lib/services'

export async function POST (req: Request): Promise<NextResponse> {
  const { longUrl, userId }: { longUrl: string, userId: string } = await req.json()
  const shortUrl = await addQrs(longUrl, userId)

  return NextResponse.json(shortUrl)
}
