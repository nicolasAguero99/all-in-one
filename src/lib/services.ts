'use server'

import { cookies } from 'next/headers'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { arrayUnion, collection, doc, setDoc, updateDoc, getDoc, type DocumentData } from 'firebase/firestore'

// Lib
import { db, storage } from '@/lib/firebase'

// Utils
import { generateRandomPath } from './utils'

// Types
import { type UserData } from '@/types/types'

export async function uploadFile (file: File, name: string, userId: string, sizeKB: number): Promise<string | { error: string, status: number }> {
  if (sizeKB > 10000) return { error: 'File size is too large', status: 400 }
  // Upload file to storage
  const fileName = generateRandomPath(file.name)
  const storageRef = ref(storage, fileName)
  await uploadBytes(storageRef, file)
  // Add file uploaded to files db
  const newFileRef = doc(collection(db, 'files'))
  const customName = name === '' ? file.name : name
  await setDoc(newFileRef, {
    name: customName,
    fileName,
    size: sizeKB,
    type: file.type,
    createdAt: new Date().toISOString()
  })
  // Add file to user files
  const userIdReference = doc(db, 'users', userId)
  const fileReference = doc(db, 'files', newFileRef.id)
  const docSnap = await getDoc(userIdReference)
  if (!docSnap.exists()) {
    await setDoc(userIdReference, {
      tokens: 10,
      created_at: new Date().toISOString()
    })
  }
  const { tokens } = docSnap.data() as { tokens: number }
  await updateDoc(userIdReference, {
    files: arrayUnion(fileReference),
    tokens: tokens - 1
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

export async function uploadPDF (file: File, name: string, userId: string, sizeKB: number): Promise<string | { error: string, status: number }> {
  if (sizeKB > 10000) return { error: 'File size is too large', status: 400 }
  // Upload file to storage
  const fileName = generateRandomPath(file.name)
  const storageRef = ref(storage, fileName)
  await uploadBytes(storageRef, file)
  const url = await getDownloadURL(storageRef)
  // Add file uploaded to files db
  const newFileRef = doc(collection(db, 'files'))
  const customName = name === '' ? file.name : name
  await setDoc(newFileRef, {
    url,
    name: customName,
    size: sizeKB,
    type: file.type,
    createdAt: new Date().toISOString()
  })
  // Add file to user files
  const userIdReference = doc(db, 'users', userId)
  const fileReference = doc(db, 'files', newFileRef.id)
  const docSnap = await getDoc(userIdReference)
  if (!docSnap.exists()) {
    await setDoc(userIdReference, {
      tokens: 10,
      created_at: new Date().toISOString()
    })
  }
  await updateDoc(userIdReference, {
    files: arrayUnion(fileReference)
  })
  // Add file to paths db
  const pathUrl = generateRandomPath()
  const newPathRef = doc(db, 'urls', pathUrl)
  await setDoc(newPathRef, {
    url
  })
  // Add that path to file
  await updateDoc(fileReference, {
    link: newPathRef
  })
  const link = newPathRef.id
  return link
}

export async function addUrls (longUrl: string, userId: string): Promise<string> {
  const shortUrl = generateRandomPath()
  const urlRef = doc(db, 'urls', shortUrl)
  await setDoc(urlRef, { url: longUrl })
  const userRef = doc(db, 'users', userId)
  const docSnap = await getDoc(userRef)
  if (!docSnap.exists()) {
    await setDoc(userRef, {
      tokens: 10,
      created_at: new Date().toISOString()
    })
  }
  await updateDoc(userRef, {
    urls: arrayUnion(urlRef)
  })
  return shortUrl
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
      const fileRef = ref(storage, dataFile.fileName as string)
      const type = dataFile.type.split('/')[0]
      const fileURL = type === 'image' ? await getDownloadURL(fileRef) : dataFile.url
      const link = dataFile.link._key.path.segments[6]
      const fileData = { ...dataFile, link, fileURL }
      return fileData
    })
  )
  return files
}

export async function getUrls (userId: string): Promise<DocumentData[] | { error: string, status: number }> {
  const docRef = doc(db, 'users', userId)
  const docSnap = await getDoc(docRef)
  if (!docSnap.exists()) return { error: 'No such document!', status: 404 }
  const dataUser = docSnap.data()
  if (dataUser.urls === undefined) return { error: 'No such document!', status: 404 }
  const urls = dataUser.urls.map((url: DocumentData) => {
    return url._key.path.segments[6]
  })
  return urls
}

export async function getTokensByUser (userId: string): Promise<number | { error: string, status: number }> {
  const docRef = doc(db, 'users', userId)
  const docSnap = await getDoc(docRef)
  if (!docSnap.exists()) return { error: 'No such document!', status: 404 }
  const dataUser = docSnap.data()
  if (dataUser.tokens === undefined) return { error: 'No such document!', status: 404 }
  const tokens = dataUser.tokens
  return tokens
}

export async function setUserDataCookies (userData: UserData): Promise<void> {
  const cookiesUser = cookies()
  const userDataString = JSON.stringify(userData)
  cookiesUser.set('userData', userDataString)
}

export async function getUserDataCookies (): Promise<UserData> {
  const cookiesUser = cookies()
  const userData = cookiesUser.get('userData')
  const value = userData?.value ?? undefined
  const data = value !== undefined ? JSON.parse(value) : undefined
  return data
}

export async function deleteUserDataCookies (): Promise<void> {
  const cookiesUser = cookies()
  cookiesUser.delete('userData')
}
