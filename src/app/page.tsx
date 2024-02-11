'use client'

import { useForm } from 'react-hook-form'
import { type z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

// Constants
import { API_URL } from '@/constants/constants'

// Schema
import { inputFiles } from '@/schema/zod'

export default function App (): JSX.Element {
  const { register, handleSubmit, formState: { errors } } = useForm<z.infer<typeof inputFiles>>({
    resolver: zodResolver(inputFiles)
  })

  const onSubmit = async (data: z.infer<typeof inputFiles>): Promise<void> => {
    const file = data.file[0] as File
    console.log('formData', file)
    const formData = new FormData()
    formData.append('file', file)

    const res = await fetch(`${API_URL}/upload`, {
      method: 'POST',
      body: formData
    })
    console.log(await res.json())
  }

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
    </div>
  )
}
