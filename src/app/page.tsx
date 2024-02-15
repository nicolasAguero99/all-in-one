'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { type z } from 'zod'

// Constants
import { API_URL } from '@/constants/constants'

// Schema
import { inputFiles } from '@/schema/zod'

// Types
import { type FileData } from '@/types/types'
import Link from 'next/link'

<<<<<<< HEAD
// Components
import UrlForm from '@/components/url-form'

=======
>>>>>>> 1939fb014a062c72e5eb97c99927840d45bb0419
export default function App (): JSX.Element {
  const [files, setFiles] = useState<FileData[]>([])
  const [link, setLink] = useState('')
  const userId = 'nLHaoQrqtO9z58uw31tu'
  const { register, handleSubmit, formState: { errors } } = useForm<z.infer<typeof inputFiles>>({
    resolver: zodResolver(inputFiles)
  })

  const onSubmit = async (data: z.infer<typeof inputFiles>): Promise<void> => {
    const file = data.file[0] as File
    console.log('formData', file)
    const formData = new FormData()
    formData.append('file', file)

    const res = await fetch(`${API_URL}/files`, {
      method: 'POST',
      body: formData
    })
    const linkToFile: string = await res.json()
    console.log(linkToFile)
    setLink(linkToFile)
  }

  const handleShare = async (path: string): Promise<void> => {
    if (navigator.share != null) {
      await navigator.share({
        title: 'Compartir url de archivo',
<<<<<<< HEAD
        text: '¡Mirá este archivo!',
        url: `/${path}`
      })
    }
=======
        text: 'Compartir url de archivo',
        url: `/${path}`
      })
    }
    console.log('share')
>>>>>>> 1939fb014a062c72e5eb97c99927840d45bb0419
  }

  useEffect(() => {
    const getFiles = async (): Promise<void> => {
      if (userId == null) return
      const res = await fetch(`${API_URL}/files/${userId}`, {
        method: 'GET'
      })
      const data: FileData[] = await res.json()
      console.log(data)
      Array.isArray(data) && setFiles(data)
    }

    void getFiles()
  }, [])

  useEffect(() => {
    console.log('files', files)
  }, [files])

  return (
    <div>
      <h1>React Quick Start</h1>
      <section>
        <h2>Acortador url</h2>
        <UrlForm />
      </section>
      <div>
        <form onSubmit={handleSubmit(onSubmit)} method='post' encType='multipart/form-data'>
          <input type='file' accept="*" {...register('file')} />
          {errors.file?.message != null && <span>{String(errors.file?.message)}</span>}
          <button type='submit' value='Upload'>Upload</button>
        </form>
        {
          link !== '' &&
          <div>
            <span>¡Listo!</span>
            <p>Link generado:</p>
            <Link href={`/${link}`}>Link</Link>
          </div>
        }
      </div>
      <section>
        <h2>Files</h2>
        <ul className='flex flex-wrap gap-4'>
          {
            files.length > 0 &&
            files.map(file => (
              <li key={file.fileURL} className='flex flex-col gap-4'>
                <Link href={`/${file.link}`}>
                  <img className='w-[250px] h-auto object-cover' src={file.fileURL} alt='image' />
                  <span>{file.name}</span>
                  <span>{file.size}</span>
                  <small>{file.createdAt}</small>
                </Link>
                <button onClick={() => { void handleShare(file.link) }}>Share</button>
              </li>
            ))
          }
        </ul>
      </section>
    </div>
  )
}
