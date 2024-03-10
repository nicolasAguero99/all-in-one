'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { type z } from 'zod'
import { shallow } from 'zustand/shallow'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import JSConfetti from 'js-confetti'

// Store
import { userStore } from '@/store/userStore'
import { errorStore } from '@/store/errorStore'

// Schema
import { inputFiles } from '@/schema/zod'

// Constants
import { API_URL } from '@/constants/constants'

// Icons
import CrossIcon from './icons/cross-icon'

// Services
import { isExistUrl } from '@/lib/services'

export default function FormFiles (): JSX.Element {
  const router = useRouter()
  const [link, setLink] = useState('')
  const [filePreview, setFilePreview] = useState({ preview: '', uploaded: '' })
  const [fileName, setFileName] = useState('')
  const [fileType, setFileType] = useState('')
  const [currentOrigin, setCurrentOrigin] = useState('')
  const [uploading, setUploading] = useState(false)
  const [customUrl, setCustomUrl] = useState('')
  const [enabledCustomUrl, setEnabledCustomUrl] = useState(false)
  const [isValidateCustomUrl, setIsValidateCustomUrl] = useState<boolean | 'pending'>(false)

  const { error } = errorStore((state) => ({
    error: state.error
  }), shallow)
  const { setError } = errorStore()

  const { user, tokens } = userStore((state) => ({
    user: state.user,
    tokens: state.tokens
  }), shallow)

  const { register, setValue, handleSubmit, formState: { errors } } = useForm<z.infer<typeof inputFiles>>({
    resolver: zodResolver(inputFiles)
  })

  useEffect(() => {
    if (typeof window === 'undefined') return
    setCurrentOrigin(`${window.location.origin}/f`)
  }, [])

  useEffect(() => {
    if (link === '') return
    const confetti = async (): Promise<void> => {
      const jsConfetti = new JSConfetti()
      await jsConfetti.addConfetti()
    }
    void confetti()
  }, [link])

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
    enabledCustomUrl && formData.append('customUrl', customUrl)
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

    const reader = new FileReader()

    reader.onloadend = function () {
      setFilePreview({ preview: '', uploaded: String(reader.result) })
    }

    reader.readAsDataURL(file)

    console.log(linkToFile)
    setFileType(file.type.split('/')[0])
    setLink(String(linkToFile))
    setUploading(false)
    setValue('file', '')
    setValue('name', '')
    router.refresh()
  }

  const handleCloseImagePreview = (): void => {
    setFilePreview({ preview: '', uploaded: '' })
    setValue('name', '')
  }

  const handleChangeFile = (e: React.ChangeEvent<HTMLInputElement>): void => {
    if (e.target.files == null) return
    const file = e.target.files[0] ?? { name: '' }
    setFileName(file.name)
    // Create a preview of the file
    const reader = new FileReader()
    reader.onloadend = function () {
      setFilePreview({ preview: String(reader.result), uploaded: '' })
    }
    reader.readAsDataURL(file)
  }

  const handleCheckCustomUrl = (e: React.ChangeEvent<HTMLInputElement>): void => {
    e.target.checked ? setEnabledCustomUrl(true) : setEnabledCustomUrl(false)
  }

  const handleCustomUrl = async (e: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
    setIsValidateCustomUrl('pending')
    if (e.target.value.length > 20) return
    setCustomUrl(e.target.value)
    if (e.target.value === '') return
    const isValid = await isExistUrl(e.target.value)
    setIsValidateCustomUrl(isValid)
  }

  return (
    <section className='flex flex-col items-center'>
    {
      link === ''
        ? <form onSubmit={handleSubmit(onSubmit)} method='post' encType='multipart/form-data' className='flex flex-col gap-6 my-4'>
          {
            filePreview.preview === ''
              ? <label htmlFor="inputFile" className="flex justify-center items-center gap-6 px-8 py-10 border-[4px] border-white border-dashed rounded-md cursor-pointer">
                  <img className='size-20' src="/icons/add-image-icon.svg" alt="agregar imagen" />
                  <div className='flex flex-col gap-2'>
                    <span className='text-lg font-semibold'>Agregar archivo</span>
                    <span className='text-sm'>Agregue un archivo desde el equipo o arrastrelo</span>
                  </div>
              </label>
              : <div className='relative'>
                  <img className='w-[500px] h-[200px] aspect-video object-cover rounded-lg' src={filePreview.preview} alt="imagen a subir" />
                  <button className='absolute top-2 right-2 shadow-md rounded-full' onClick={handleCloseImagePreview}>
                    <CrossIcon fullIcon={false} />
                  </button>
                </div>
          }
          <input className='hidden' id='inputFile' type='file' accept="*" {...register('file', { onChange: handleChangeFile })} disabled={uploading || Number(tokens) < 1} />
          {errors.file?.message != null && <span>{String(errors.file?.message)}</span>}
          <div className='flex gap-2'>
            <div className='flex w-full relative'>
              <input className='flex-1 relative px-4 bg-slate-200 text-black py-2 rounded-lg shadow-md transition-all ease-out duration-300 z-20' type='text' placeholder={`${fileName !== '' ? `${fileName} (por defecto)` : 'Nombre del archivo'}`} {...register('name')} disabled={uploading || Number(tokens) < 1} />
              <div className='top-7 absolute right-0 flex w-full transition-all ease-out duration-300'>
                <div className='relative w-full'>
                  <input className='absolute top-5 left-[10px] size-4 shadow-lg z-30 cursor-pointer' type="checkbox" onChange={handleCheckCustomUrl} />
                  <input className='shadow-md relative w-full h-full px-10 bg-slate-200 text-black pt-4 pb-2 rounded-b-lg transition-all ease-out duration-300 z-10 disabled:opacity-50' type='text' placeholder='Url personalizado' disabled={!enabledCustomUrl} {...register('customUrl')} onChange={handleCustomUrl} value={customUrl} />
                </div>
              </div>
            </div>
            <button disabled={uploading || Number(tokens) < 1} className={`${uploading ? 'opacity-50' : ''} bg-blue-400 text-white w-fit px-4 py-2 rounded-lg disabled:opacity-30`} type='submit' value='Upload'>{!uploading ? 'Subir' : 'Subiendo...'}</button>
          </div>
          <div className='flex flex-col justify-center items-center mt-10'>
            {
              enabledCustomUrl && <div className='flex flex-col justify-center items-center text-lg'>
                <div className={`${isValidateCustomUrl === true ? 'text-green-500' : 'text-red-500'} flex items-center`}>
                  <small>{currentOrigin}/</small><span>{customUrl}</span>
                </div>
                {
                  (isValidateCustomUrl === false && customUrl !== '') && <span className='text-sm text-red-500'>Url no disponible</span>
                }
                {errors.customUrl?.message != null && <span className='text-red-600'>{String(errors.customUrl?.message)}</span>}
              </div>
            }
          </div>
          {errors.file?.message != null && <span>{String(errors.name?.message)}</span>}
          {error != null && <p className='text-red-600'>{error}</p>}
          {
            user.uid !== ''
              ? Number(tokens) < 1 && <span className='text-red-600'>No tienes tokens suficientes</span>
              : <span className='text-red-600'>Debes iniciar sesión</span>
          }
        </form>
        : <section className='flex flex-col items-center gap-4'>
            <span>¡Listo!</span>
            <p>Link generado:</p>
            {
              fileType === 'image'
                ? <Link className='underline text-blue-600' href={`/f/${link}`}>
                    <img className='w-[500px] h-[200px] aspect-video object-cover rounded-lg my-6' src={filePreview.uploaded} alt='file uploaded' />
                    {/* {link} */}
                  </Link>
                : <Link className='underline text-blue-600' href={`/${link}`}>{link}</Link>
            }
            <button onClick={() => { setLink('') }} className='bg-blue-400 text-white w-fit px-4 py-2 rounded-lg'>Subir más</button>
          </section>
    }
    </section>
  )
}
