'use server'

import { cookies } from 'next/headers'
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage'
import { arrayUnion, collection, doc, setDoc, updateDoc, getDoc, type DocumentData, deleteDoc, arrayRemove } from 'firebase/firestore'

// Lib
import { db, storage } from '@/lib/firebase'

// Utils
import { generateRandomPath } from './utils'

// Types
import { type UserData, type FileData } from '@/types/types'

// Constants
import { API_URL } from '@/constants/constants'

export async function getFilesByUser (userId: string): Promise<FileData[]> {
  const res = await fetch(`${API_URL}/users/${userId}`, { cache: 'no-cache' })
  const data: FileData[] = await res.json()
  return data
}

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
  // If user doesn't exist, create it
  if (!docSnap.exists()) {
    await setDoc(userIdReference, {
      tokens: 10,
      created_at: new Date().toISOString()
    })
  }
  // Subtract one token to user
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
    fileName,
    name: customName,
    size: sizeKB,
    type: file.type,
    createdAt: new Date().toISOString()
  })
  // Add file to user files
  const userIdReference = doc(db, 'users', userId)
  const fileReference = doc(db, 'files', newFileRef.id)
  const docSnap = await getDoc(userIdReference)
  // If user doesn't exist, create it
  if (!docSnap.exists()) {
    await setDoc(userIdReference, {
      tokens: 10,
      created_at: new Date().toISOString()
    })
  }
  // Subtract one token to user
  const { tokens } = docSnap.data() as { tokens: number }
  await updateDoc(userIdReference, {
    files: arrayUnion(fileReference),
    tokens: tokens - 1
  })
  await updateDoc(userIdReference, {
    files: arrayUnion(fileReference)
  })
  // Add file to paths db
  const pathUrl = generateRandomPath()
  const newPathRef = doc(db, 'urls', pathUrl)
  await setDoc(newPathRef, {
    url,
    file: fileReference
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
  if (dataUser.files === undefined) return { error: 'No such document!', status: 404 }
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
      const fileData = type === 'image' ? { ...dataFile, link, fileURL } : { ...dataFile, link }
      return fileData
    })
  )
  return files
}

export async function getUrls (userId: string): Promise<Array<{ url: string, longUrl: string }> | { error: string, status: number }> {
  const docRef = doc(db, 'users', userId)
  const docSnap = await getDoc(docRef)
  if (!docSnap.exists()) return { error: 'No such document!', status: 404 }
  const dataUser = docSnap.data()
  if (dataUser.urls === undefined) return { error: 'No such document!', status: 404 }
  const urls = await Promise.all(dataUser.urls.map(async (eachUrl: DocumentData) => {
    const url = eachUrl._key.path.segments[6] as string
    const urlRef = doc(db, 'urls', url)
    const urlSnap = await getDoc(urlRef)
    if (!urlSnap.exists()) return { error: 'No such document!', status: 404 }
    const urlData = urlSnap.data()
    const longUrl = urlData.url
    return { url, longUrl }
  }))
  return urls
}

export async function deleteFile (id: string, userId: string, fileName: string, type: string): Promise<unknown | { error: string, status: number }> {
  const userRef = doc(db, 'users', userId)
  const pathRef = type === 'image' ? doc(db, 'paths', id) : doc(db, 'urls', id)
  const imagenRef = ref(storage, fileName)
  // Get the path's file
  const pathSnap = await getDoc(pathRef)
  if (!pathSnap.exists()) return { error: 'No such document!', status: 404 }
  const data = pathSnap.data()
  const fileId: string = data.file._key.path.segments[6]

  console.log('fileId', fileId)

  const fileRef = doc(db, 'files', fileId)
  const userSnap = await getDoc(userRef)
  if (!userSnap.exists()) return { error: 'No such document!', status: 404 }
  const userData = userSnap.data()
  if (userData.files === undefined || userData.tokens === undefined) return { error: 'No such document!', status: 404 }
  // Delete file and path
  await updateDoc(userRef, {
    files: arrayRemove(fileRef)
  })
  await deleteDoc(fileRef)
  await deleteDoc(pathRef)
  await deleteObject(imagenRef)
  // Return one token to user
  await updateDoc(userRef, {
    tokens: userData.tokens + 1
  })
}

export async function deleteUrl (id: string, userId: string): Promise<{ message: string, status: number } | { error: string, status: number }> {
  const userRef = doc(db, 'users', userId)
  const urlRef = doc(db, 'urls', id)
  const docSnap = await getDoc(userRef)
  if (!docSnap.exists()) {
    return { error: 'User not found', status: 400 }
  }
  await updateDoc(userRef, {
    urls: arrayRemove(urlRef)
  })
  await deleteDoc(urlRef)
  return { message: 'Url deleted', status: 200 }
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

// Cookies

export async function setUserDataCookies (userData: UserData): Promise<void> {
  const cookiesUser = cookies()
  const userDataString = JSON.stringify(userData)
  cookiesUser.set('userData', userDataString)
}

export async function getUserDataCookies (): Promise<UserData> {
  const cookiesUser = cookies()
  const userData = cookiesUser.get('userData')
  const value = (userData?.value != null && userData?.value !== '') ? userData?.value : undefined
  const data = value !== undefined ? JSON.parse(value) : undefined
  return data
}

export async function deleteUserDataCookies (): Promise<void> {
  const cookiesUser = cookies()
  cookiesUser.delete('userData')
}
