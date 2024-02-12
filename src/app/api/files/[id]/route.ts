import { NextResponse } from 'next/server'
import { doc, getDoc } from 'firebase/firestore'
import { getDownloadURL, ref } from 'firebase/storage'

// Lib
import { db, storage } from '@/lib/firebase'

export async function GET (req: any, { params }: { params: { id: string } }): Promise<NextResponse> {
  const { id } = params
  const docRef = doc(db, 'users', id)
  const docSnap = await getDoc(docRef)
  if (!docSnap.exists()) return NextResponse.json({ error: 'No such document!' }, { status: 404 })
  const dataUser = docSnap.data()
  const files = await Promise.all(
    dataUser.files.map(async (file: any) => {
      const fileId: string = file._key.path.segments[6]
      const docRef = doc(db, 'files', fileId)
      const docSnap = await getDoc(docRef)
      if (!docSnap.exists()) return NextResponse.json({ error: 'No such document!' }, { status: 404 })
      const dataFile = docSnap.data()
      const fileRef = ref(storage, dataFile.name as string)
      const fileURL = await getDownloadURL(fileRef)
      const fileData = { ...dataFile, fileURL }
      return fileData
    })
  )

  return NextResponse.json(files)
}
