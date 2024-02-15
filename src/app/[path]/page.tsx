'use client'

import { useEffect, useState } from 'react'
import { type DocumentData, doc, getDoc } from 'firebase/firestore'
import { getDownloadURL, ref } from 'firebase/storage'

// Lib
import { db, storage } from '@/lib/firebase'

// Components
import NotFound from '@/components/not-found'

export default function PathPage ({ params }: { params: { path: string } }): JSX.Element {
  console.log('path', params)
  const { path } = params
  const [file, setFile] = useState('')
  const [isExist, setIsExist] = useState(true)

  useEffect(() => {
    const getPaths = async (): Promise<DocumentData | undefined> => {
      try {
        const docRef = doc(db, 'paths', path)
        const docSnap = await getDoc(docRef)
        if (!docSnap.exists()) {
          setIsExist(false)
          return
        }
        const data = docSnap.data()
        const fileReference = doc(db, 'files', data?.file.id as string)
        const fileDoc = await getDoc(fileReference)
        const fileData = fileDoc.data() as { name: string }
        const fileRef = ref(storage, fileData.name)
        const file = await getDownloadURL(fileRef)
        setFile(file)
        console.log('fileData', file)

        return data
      } catch (error) {
        console.error('Error fetching data:', error)
        setIsExist(false)
        return undefined
      }
    }
    void getPaths()
  }, [path])

  if (!isExist) {
    return <NotFound />
  }

  return (
    <div>
      <h1>Path Page</h1>
      <p>{path}</p>
      {
        file != null && (
          <img className='w-[250px] h-auto object-cover' src={file} alt='image' />
        )
      }
    </div>
  )
}
