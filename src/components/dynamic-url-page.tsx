'use client'

import { useEffect, useState } from 'react'
import { type DocumentData, doc, getDoc } from 'firebase/firestore'
import { useRouter } from 'next/navigation'

// Lib
import { db } from '@/lib/firebase'

// Components
import NotFound from '@/components/not-found'

export default function DynamicUrlPage ({ paramsValue }: { paramsValue: { url: string } }): JSX.Element | undefined {
  const { url } = paramsValue
  const [isExist, setIsExist] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const getUrls = async (): Promise<DocumentData | undefined> => {
      try {
        const docRef = doc(db, 'urls', url)
        const docSnap = await getDoc(docRef)
        if (!docSnap.exists()) {
          setIsExist(false)
          return
        }
        const data = docSnap.data()
        router.replace(data.url as string)
        return data
      } catch (error) {
        console.error('Error fetching data:', error)
        setIsExist(false)
        return undefined
      }
    }
    void getUrls()

    return () => {
      setIsExist(true)
    }
  }, [url])

  if (!isExist) {
    return <NotFound />
  }
}
