import { NextResponse } from 'next/server'

// Utils
import { generateRandomPath } from '@/lib/utils'

export async function POST (req: Request): Promise<NextResponse> {
  const data = await req.json()
  console.log('data', data)
  const shortUrl = generateRandomPath()

  return NextResponse.json(shortUrl)
}
