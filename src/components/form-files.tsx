'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { type z } from 'zod'
import { shallow } from 'zustand/shallow'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

// Store
import { userStore } from '@/store/userStore'
import { errorStore } from '@/store/errorStore'

// Schema
import { inputFiles } from '@/schema/zod'

// Constants
import { API_URL } from '@/constants/constants'

export default function FormFiles (): JSX.Element {
  const router = useRouter()
  const [link, setLink] = useState('')
  const [fileName, setFileName] = useState('')
  const [fileType, setFileType] = useState('')
  const [uploading, setUploading] = useState(false)

  const { error } = errorStore((state) => ({
    error: state.error
  }), shallow)
  const { setError } = errorStore()

  const { user, tokens } = userStore((state) => ({
    user: state.user,
    tokens: state.tokens
  }), shallow)

  const { register, handleSubmit, formState: { errors } } = useForm<z.infer<typeof inputFiles>>({
    resolver: zodResolver(inputFiles)
  })

  const onSubmit = async (data: z.infer<typeof inputFiles>): Promise<void> => {
    if (Number(tokens) <= 0) {
      setError('No tienes tokens suficientes')
      return
    }
    if (user.uid === '') return
    setUploading(true)
    const file = data.file[0] as File
    console.log('formData', file)
    const formData = new FormData()
    formData.append('file', file)
    formData.append('name', data.name)
    formData.append('userId', user.uid)
    console.log('user.uid', user.uid)
    const res = await fetch(`${API_URL}/files`, {
      method: 'POST',
      body: formData
    })
    const linkToFile: string | { error: string } = await res.json()
    if (typeof linkToFile === 'object' && linkToFile.error != null) {
      setError(linkToFile.error)
      setUploading(false)
      return
    }
    console.log(linkToFile)
    setFileType(file.type.split('/')[0])
    setLink(String(linkToFile))
    setUploading(false)
    router.refresh()
  }

  const handleChangeFile = (e: React.ChangeEvent<HTMLInputElement>): void => {
    if (e.target.files == null) return
    const file = e.target.files[0] ?? { name: '' }
    setFileName(file.name)
  }

  return (
    <section>
      {
        Number(tokens) > 0
          ? <>
              {
                <form onSubmit={handleSubmit(onSubmit)} method='post' encType='multipart/form-data' className='flex flex-col gap-2 my-4'>
                  <input type='file' accept="*" {...register('file', { onChange: handleChangeFile })} />
                  {errors.file?.message != null && <span>{String(errors.file?.message)}</span>}
                  <input className='w-[350px] border-2 border-slate-500 px-4' type='text' placeholder={`${fileName !== '' ? `${fileName} (por defecto)` : 'Escribe un nombre'}`} {...register('name')} />
                  {errors.file?.message != null && <span>{String(errors.name?.message)}</span>}
                  <button disabled={uploading} className={`${uploading ? 'opacity-50' : ''} bg-blue-400 text-white w-fit px-4 py-2 rounded-lg`} type='submit' value='Upload'>{!uploading ? 'Subir' : 'Subiendo...'}</button>
                  {error != null && <p className='text-red-600'>{error}</p>}
                </form>
              }
            </>
          : <span>No tienes tokens suficientes</span>
      }
      {
        link !== '' &&
        <div>
          <span>¡Listo!</span>
          <p>Link generado:</p>
          {
            fileType === 'image'
              ? <Link className='underline text-blue-600' href={`/f/${link}`}>{link}</Link>
              : <Link className='underline text-blue-600' href={`/${link}`}>{link}</Link>
          }
        </div>
      }
    </section>
  )
}
