'use server'

import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { arrayUnion, collection, doc, setDoc, updateDoc, getDoc, type DocumentData } from 'firebase/firestore'

// Lib
import { db, storage } from '@/lib/firebase'

// Services
import { generateRandomPath } from './utils'

export async function uploadFile (file: File, sizeKB: number): Promise<string | { error: string, status: number }> {
  if (sizeKB > 10000) return { error: 'File size is too large', status: 400 }
  // Upload file to storage
  const fileName = generateRandomPath(file.name)
  const storageRef = ref(storage, fileName)
  await uploadBytes(storageRef, file)
  // Add file uploaded to user
  const newFileRef = doc(collection(db, 'files'))
  await setDoc(newFileRef, {
    name: fileName,
    size: sizeKB,
    type: file.type,
    createdAt: new Date().toISOString()
  })
  // Add file to user files
  const userIdReference = doc(db, 'users', 'nLHaoQrqtO9z58uw31tu')
  const fileReference = doc(db, 'files', newFileRef.id)
  await updateDoc(userIdReference, {
    files: arrayUnion(fileReference)
  })
  // Add file to paths db
  const pathUrl = generateRandomPath()
  const newPathRef = doc(db, 'paths', pathUrl)
  await setDoc(newPathRef, {
    file: fileReference
  })
  // Add that path to file
  await updateDoc(fileReference, {
    link: newPathRef
  })
  const link = newPathRef.id
  return link
}

export async function getFiles (userId: string): Promise<DocumentData[] | { error: string, status: number }> {
  const docRef = doc(db, 'users', userId)
  const docSnap = await getDoc(docRef)
  if (!docSnap.exists()) return { error: 'No such document!', status: 404 }
  const dataUser = docSnap.data()
  const files: DocumentData[] = await Promise.all(
    dataUser.files.map(async (file: any) => {
      const fileId: string = file._key.path.segments[6]
      const docRef = doc(db, 'files', fileId)
      const docSnap = await getDoc(docRef)
      if (!docSnap.exists()) return { error: 'No such document!', status: 404 }
      const dataFile = docSnap.data()
      const fileRef = ref(storage, dataFile.name as string)
      const fileURL = await getDownloadURL(fileRef)
      const link = dataFile.link._key.path.segments[6]
      const fileData = { ...dataFile, link, fileURL }
      return fileData
    })
  )
  return files
}
