import { NextResponse } from 'next/server'

// Services
import { addUrls } from '@/lib/services'

export async function POST (req: Request): Promise<NextResponse> {
  const { longUrl, userId, customUrl }: { longUrl: string, userId: string, customUrl: string } = await req.json()
  const shortUrl = await addUrls(longUrl, userId, customUrl)

  return NextResponse.json(shortUrl)
}
