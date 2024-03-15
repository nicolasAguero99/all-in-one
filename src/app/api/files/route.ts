import { NextResponse } from 'next/server'

// Utils
import { formatToKB } from '@/lib/utils'

// Services
import { uploadFile, uploadPDF } from '@/lib/services'

// Constants
import { FILE_TYPES } from '@/constants/constants'

export async function POST (req: Request): Promise<NextResponse> {
  const data = await req.formData()
  const file = data.get('file') as File
  const name = data.get('name') as string
  const userId = data.get('userId') as string
  const customUrl = data.get('customUrl') as string ?? ''
  const sizeKB = formatToKB(file.size)
  const type = file.type.split('/')[0]
  const link = (type === FILE_TYPES.IMAGE || type === FILE_TYPES.VIDEO) ? await uploadFile(file, name, userId, sizeKB, customUrl) : await uploadPDF(file, name, userId, sizeKB, customUrl)

  return NextResponse.json(link)
}
