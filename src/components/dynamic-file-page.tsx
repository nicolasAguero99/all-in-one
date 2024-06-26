'use client'

import { useEffect, useState } from 'react'
import { type DocumentData, doc, getDoc } from 'firebase/firestore'
import { getDownloadURL, ref } from 'firebase/storage'

// Lib
import { storage, db } from '@/lib/firebase'

// Components
import NotFound from '@/components/not-found'

// Icons
import DownloadIcon from './icons/download-icon'
import ShareIcon from './icons/share-icon'
import ExternalIcon from './icons/external-icon'
import { FILE_TYPES } from '@/constants/constants'

export default function DynamicFilePage ({ paramsValue }: { paramsValue: { path: string } }): JSX.Element | undefined {
  const { path } = paramsValue
  const [fileType, setFileType] = useState({ type: '', extension: '' })
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
        const fileData = fileDoc.data()
        const fileRef = ref(storage, fileData?.fileName as string)
        const file = await getDownloadURL(fileRef)
        setFile(file)
        setFileType({ type: fileData?.type.split('/')[0], extension: fileData?.type.split('/')[1] })
        return data
      } catch (error) {
        console.error('Error fetching data:', error)
        setIsExist(false)
        return undefined
      }
    }
    void getPaths()
  }, [path])

  const handleDownloadFile = async (): Promise<void> => {
    const res = await fetch(file)
    const blobFile = await res.blob()
    const blobUrl = URL.createObjectURL(blobFile)
    const extension = fileType.extension
    const fileName = `file-${path}.${extension}`
    const link = document.createElement('a')
    link.href = blobUrl
    link.download = fileName
    link.click()
    URL.revokeObjectURL(blobUrl)
  }

  const handleFullView = async (): Promise<void> => {
    try {
      const fileRef = ref(storage, file)
      const fileUrl = await getDownloadURL(fileRef)
      window.open(fileUrl)
    } catch (error) {
      console.error('Error downloading file:', error)
    }
  }

  const handleShare = async (): Promise<void> => {
    if (navigator.share != null) {
      await navigator.share({
        title: 'Compartir archivo',
        text: '¡Mirá este archivo!',
        url: `/f/${path}`
      })
    }
  }

  if (!isExist) {
    return <NotFound />
  }

  return (
    <main className='flex flex-col gap-8 items-center'>
      {
        file != null &&
          fileType.type === FILE_TYPES.IMAGE
          ? <img className='size-auto max-w-[800px] object-cover' src={file} alt='image uploaded' />
          : <video className='w-[250px] h-[150px] object-cover transition-transform ease-out duration-300 z-10' controls>
              <source src={file} type={`video/${fileType.extension}`} />
            </video>
      }
      <div className='flex gap-8 items-center'>
        <button className='bg-white shadow-md rounded-lg p-1 [&>svg]:size-8' onClick={handleDownloadFile}><DownloadIcon /></button>
        <button className='bg-white shadow-md rounded-lg p-1 [&>svg]:size-8' onClick={handleFullView}><ExternalIcon /></button>
        <button className='bg-white shadow-md rounded-lg p-1 [&>svg]:size-8' onClick={handleShare}><ShareIcon color='000000' /></button>
      </div>
    </main>
  )
}
