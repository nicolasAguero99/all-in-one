import { NextResponse } from 'next/server'

// Utils
import { formatToKB } from '@/lib/utils'

// Services
import { uploadFile, uploadPDF } from '@/lib/services'

export async function POST (req: Request): Promise<NextResponse> {
  const data = await req.formData()
  const file = data.get('file') as File
  const name = data.get('name') as string
  const userId = data.get('userId') as string
  const customUrl = data.get('customUrl') as string ?? ''
  const sizeKB = formatToKB(file.size)
  const type = file.type.split('/')[0]
  const link = type === 'image' ? await uploadFile(file, name, userId, sizeKB, customUrl) : await uploadPDF(file, name, userId, sizeKB, customUrl)

  return NextResponse.json(link)
}
