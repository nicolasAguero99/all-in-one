import { NextResponse } from 'next/server'

// Services
import { addUrls } from '@/lib/services'

export async function POST (req: Request): Promise<NextResponse> {
  const { longUrl }: { longUrl: string } = await req.json()
  const shortUrl = await addUrls(longUrl)

  return NextResponse.json(shortUrl)
}
