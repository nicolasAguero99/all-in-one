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

export default function App (): JSX.Element {
  const [files, setFiles] = useState<FileData[]>([])
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
    console.log(await res.json())
  }

  useEffect(() => {
    const getFiles = async (): Promise<void> => {
      const res = await fetch(`${API_URL}/files/${userId}`, {
        method: 'GET'
      })
      const data: FileData[] = await res.json()
      console.log(data)
      setFiles(data)
    }
    void getFiles()
  }, [])

  useEffect(() => {
    console.log('files', files)
  }, [files])

  return (
    <div>
      <h1>React Quick Start</h1>
      <div>
        <form onSubmit={handleSubmit(onSubmit)} method='post' encType='multipart/form-data'>
          <input type='file' accept="*" {...register('file')} />
          {errors.file?.message != null && <span>{String(errors.file?.message)}</span>}
          <button type='submit' value='Upload'>Upload</button>
        </form>
      </div>
      <section>
        <h2>Files</h2>
        <ul className='flex gap-4'>
          {
            files.length > 0 &&
            files.map((file: any) => (
              <li key={file.fileURL} className='flex flex-col gap-4'>
                <img className='w-[250px] h-auto object-cover' src={file.fileURL} alt='image' />
                <span>{file.name}</span>
                <span>{file.size}</span>
                <small>{file.createdAt}</small>
              </li>
            ))
          }
        </ul>
      </section>
    </div>
  )
}
