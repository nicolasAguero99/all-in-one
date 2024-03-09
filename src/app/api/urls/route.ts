import { NextResponse } from 'next/server'

// Services
import { addUrls, isExistUrl } from '@/lib/services'

export async function POST (req: Request): Promise<NextResponse> {
  const { longUrl, userId, customUrl }: { longUrl: string, userId: string, customUrl: string } = await req.json()
  if (customUrl !== '') {
    const isValid = await isExistUrl(customUrl)
    console.log('isValid', isValid)
    if (!isValid) return NextResponse.json({ error: 'La url personalizada ya existe' }, { status: 400 })
  }
  const shortUrl = await addUrls(longUrl, userId, customUrl)

  return NextResponse.json(shortUrl)
}
