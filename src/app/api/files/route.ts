import { NextResponse } from 'next/server'
import { arrayUnion, collection, doc, setDoc, updateDoc } from 'firebase/firestore'

// Lib
import { ref, uploadBytes } from 'firebase/storage'
import { db, storage } from '@/lib/firebase'

// Utils
import { formatToKB } from '@/lib/utils'

export async function POST (req: Request): Promise<NextResponse> {
  const data = await req.formData()
  const file = data.get('file') as File
  const sizeKB = formatToKB(file.size)
  if (sizeKB > 10000) return NextResponse.json({ error: 'File size is too large' }, { status: 400 })
  const storageRef = ref(storage, file.name)
  await uploadBytes(storageRef, file)
  const userIdReference = doc(db, 'users', 'nLHaoQrqtO9z58uw31tu')
  const newFileRef = doc(collection(db, 'files'))
  await setDoc(newFileRef, {
    name: file.name,
    size: sizeKB,
    createdAt: new Date().toISOString()
  })
  const fileReference = doc(db, 'files', newFileRef.id)
  await updateDoc(userIdReference, {
    files: arrayUnion(fileReference)
  })
  const newPathRef = doc(collection(db, 'paths'))
  await setDoc(newPathRef, {
    file: fileReference
  })
  await updateDoc(fileReference, {
    link: newPathRef
  })

  const link = newPathRef.id

  return NextResponse.json(link)
}
