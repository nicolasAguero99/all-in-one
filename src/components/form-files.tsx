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
import { API_URL, FILE_TYPES } from '@/constants/constants'

// Icons
import CrossIcon from './icons/cross-icon'

// Services
import { isExistUrl } from '@/lib/services'

// Types
import { TypesServices } from '@/types/types.d'

export default function FormFiles (): JSX.Element {
  const router = useRouter()
  const [link, setLink] = useState('')
  const [filePreview, setFilePreview] = useState('')
  const [fileName, setFileName] = useState('')
  const [fileType, setFileType] = useState({ type: '', extension: '' })
  const [currentOrigin, setCurrentOrigin] = useState('')
  const [uploading, setUploading] = useState(false)
  const [customUrl, setCustomUrl] = useState('')
  const [showInputCustomUrl, setShowInputCustomUrl] = useState(false)
  const [enabledCustomUrl, setEnabledCustomUrl] = useState(false)
  const [isValidateCustomUrl, setIsValidateCustomUrl] = useState<boolean | 'pending'>(false)
  const [showModalConfirm, setShowModalConfirm] = useState(false)

  const { error } = errorStore((state) => ({
    error: state.error
  }), shallow)
  const { setError } = errorStore()

  const { user, tokens } = userStore((state) => ({
    user: state.user,
    tokens: state.tokens
  }), shallow)

  const { register, setValue, getValues, setError: setErrors, handleSubmit, formState: { errors } } = useForm<z.infer<typeof inputFiles>>({
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
    setShowModalConfirm(false)
    if (Number(tokens) <= 0) {
      setError('No tienes tokens suficientes')
      return
    }
    if (user.uid === '') return
    setUploading(true)
    const file = data.file[0] as File
    const formData = new FormData()
    formData.append('file', file)
    formData.append('name', data.name.trim())
    formData.append('userId', user.uid)
    enabledCustomUrl && formData.append('customUrl', customUrl)
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
      setFilePreview(String(reader.result))
    }
    reader.readAsDataURL(file)
    setFileType({ type: file.type.split('/')[0], extension: file.type.split('/')[1] })
    setLink(String(linkToFile))
    setUploading(false)
    setValue('file', '')
    setValue('name', '')
    router.refresh()
  }

  const handleShowModal = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault()
    if (isValidateCustomUrl === false && enabledCustomUrl) return
    setShowModalConfirm(true)
    const file = getValues('file')
    const name = getValues('name') ?? ''
    if (errors.name?.message != null) setErrors('name', { message: '' })
    if (errors.file?.message != null) setErrors('file', { message: '' })
    try {
      inputFiles.parse({ file, name })
    } catch (error) {
      const { message } = (error as { errors: [{ message: string }] }).errors[0] ?? { message: 'Ha ocurrido un error' }
      const { path } = (error as { errors: [{ path: string }] }).errors[0]

      console.log('path', path[0])

      if (path[0] === 'file') setErrors('file', { message })
      if (path[0] === 'name') setErrors('name', { message })
      setShowModalConfirm(false)
    }
  }

  const handleCloseImagePreview = (): void => {
    setFilePreview('')
    setFileType({ type: '', extension: '' })
    setValue('name', '')
  }

  const handleChangeFile = (e: React.ChangeEvent<HTMLInputElement>): void => {
    if (e.target.files == null) return
    const file = e.target.files[0] ?? { name: '' }
    console.log('file', file)
    setFileName(file.name)
    // Create a preview of the file
    const reader = new FileReader()
    reader.onloadend = function () {
      setFilePreview(String(reader.result))
      setFileType({ type: file.type.split('/')[0], extension: file.type.split('/')[1] })
    }
    reader.readAsDataURL(file)
  }

  const handleCheckCustomUrl = (e: React.ChangeEvent<HTMLInputElement>): void => {
    e.target.checked ? setEnabledCustomUrl(true) : setEnabledCustomUrl(false)
  }

  const handleType = (e: React.ChangeEvent<HTMLInputElement>): void => {
    e.target.value === '' ? setShowInputCustomUrl(false) : setShowInputCustomUrl(true)
  }

  const handleCustomUrl = async (e: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
    setIsValidateCustomUrl('pending')
    if (e.target.value.length > 20) return
    setCustomUrl(e.target.value)
    if (e.target.value === '') return
    const isValid = await isExistUrl(e.target.value, TypesServices.FILE)
    setIsValidateCustomUrl(isValid)
  }

  const handleResetForm = (): void => {
    setLink('')
    setFilePreview('')
    setFileName('')
    setFileType({ type: '', extension: '' })
  }

  return (
    <section className='flex flex-col items-center'>
    {
      showModalConfirm &&
      <>
        <div onClick={() => { setShowModalConfirm(false) }} className='fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 z-40 cursor-pointer' />
        <div className='w-3/5 h-[250px] flex flex-col justify-center fixed top-0 left-0 right-0 bottom-0 m-auto px-4 py-4 rounded-lg shadow-lg shadow-[#ffffff]/5 bg-bckg z-50'>
          {
            user.uid !== ''
              ? <>
                <div className='flex flex-col gap-4 items-center'>
                  <span className='text-3xl font-semibold'>Subir archivo</span>
                  <p className='text-white/60'>¿Estás seguro de subir archivo? Gastarás 1 token</p>
                  </div>
                  <div className='flex justify-center items-center gap-6 mt-10'>
                    <button className='bg-bckg text-primary border-[1px] border-r-primary py-2 px-4 rounded-lg' onClick={() => { setShowModalConfirm(false) }}>Cancelar</button>
                    <button className='bg-primary text-bckg py-2 px-4 rounded-lg' onClick={handleSubmit(onSubmit)}>Aceptar</button>
                </div>
                </>
              : <>
                <div className='flex flex-col gap-6 items-center'>
                  <span className='text-3xl font-semibold'>Iniciar sesión</span>
                  <p className='text-white/60'>Para realizar esta operación debes iniciar sesión y obtener tokens</p>
                  </div>
                  <div className='flex justify-between items-center gap-4'>
                    <button className='bg-blue-600 text-white w-fit px-4 py-2 rounded-lg' onClick={() => { setShowModalConfirm(false) }}>Aceptar</button>
                  </div>
                </>
          }
        </div>
      </>
    }
    {
      link === ''
        ? <form onSubmit={handleShowModal} method='post' encType='multipart/form-data' className='w-full max-w-[800px] flex flex-col justify-center items-center gap-2 mt-4 mb-12'>
          {
            filePreview === ''
              ? <label htmlFor="inputFile" className={`${(uploading || Number(tokens) < 1) ? 'opacity-30 cursor-not-allowed' : ''} w-[calc(100%-50px)] flex justify-center items-center gap-10 px-8 py-14 border-[4px] border-white border-dashed rounded-md cursor-pointer`}>
                <img className='size-24' src="/icons/add-image-icon.svg" alt="agregar imagen" />
                <div className='flex flex-col gap-2'>
                  <span className='text-lg font-semibold'>Agregar archivo</span>
                  <span className='text-sm'>Agregue un archivo desde el equipo o arrastrelo</span>
                </div>
              </label>
              : <div className='relative'>
                {
                  fileType.type === FILE_TYPES.IMAGE
                    ? <img className='w-[500px] h-[200px] aspect-video object-cover rounded-lg' src={filePreview} alt="imagen a subir" />
                    : <video className='w-[500px] h-[200px] aspect-video object-cover rounded-lg' src={filePreview} controls>
                      <source src={filePreview} type={`video/${fileType.extension}`} />
                    </video>
                }
                  <button className='bg-white absolute top-2 right-2 shadow-md rounded-full' onClick={handleCloseImagePreview}>
                    <CrossIcon fullIcon={false} />
                  </button>
                </div>
          }
          <input className='hidden' id='inputFile' type='file' accept="*" {...register('file', { onChange: handleChangeFile })} disabled={uploading || Number(tokens) < 1} />
          {errors.file?.message != null && <span className='text-red-600'>{String(errors.file?.message)}</span>}
          <div className='flex justify-center w-full gap-2 mt-8'>
            <div className='flex w-full relative'>
              <input className='w-full relative bg-primary text-secondary py-2 ps-10 rounded-full border-[1px] border-primary transition-all ease-out duration-300 z-20 disabled:cursor-not-allowed' type='text' placeholder={`${fileName !== '' ? `${fileName} (por defecto)` : 'Nombre del archivo'}`} {...register('name')} onChange={handleType} disabled={uploading || Number(tokens) < 1} />
              <div className={`${showInputCustomUrl ? 'top-9' : 'top-4'} absolute -left-1 w-full flex transition-all ease-out duration-300 z-10`}>
                <div className={`${showInputCustomUrl ? '[&>*]:opacity-100' : '[&>*]:opacity-0'} relative w-full`}>
                  <input className='absolute top-[19px] left-[16px] size-4 shadow-lg z-30 cursor-pointer' type="checkbox" onChange={handleCheckCustomUrl} />
                  <input className={`${showInputCustomUrl ? 'pt-4 pb-3 disabled:opacity-50 text-primary' : 'disabled:opacity-100 placeholder:text-transparent text-transparent'} relative size-full px-11 py-2 bg-bckg w-[calc(100%+10px)] h-full border-[1px] border-primary rounded-full transition-all ease-out duration-300 z-10 disabled:opacity-50`} type='text' placeholder='Url personalizado' disabled={!enabledCustomUrl} {...register('customUrl')} onChange={handleCustomUrl} value={customUrl} />
                </div>
              </div>
              <button disabled={uploading || Number(tokens) < 1} className={`${uploading ? 'opacity-50' : ''} absolute top-[1px] right-[1px] w-fit bg-bckg text-white px-8 py-2 rounded-full z-30 disabled:opacity-30`} type='submit' value='Upload'>{!uploading ? 'Subir' : 'Subiendo...'}</button>
            </div>
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
          {errors.name?.message != null && <span className='text-red-600'>{String(errors.name?.message)}</span>}
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
              (fileType.type === FILE_TYPES.IMAGE || fileType.type === FILE_TYPES.VIDEO)
                ? <Link className='underline text-blue-600' href={`/f/${link}`}>
                  {
                    fileType.type === FILE_TYPES.IMAGE
                      ? <img className='w-[500px] h-[200px] aspect-video object-cover rounded-lg my-6' src={filePreview} alt='file uploaded' />
                      : <video className='w-[500px] h-[200px] aspect-video object-cover rounded-lg my-6' controls>
                          <source src={filePreview} type={`video/${fileType.extension}`} />
                        </video>
                  }
                  </Link>
                : <Link className='underline text-blue-600' href={`/${link}`}>{link}</Link>
            }
            <button onClick={handleResetForm} className='bg-blue-400 text-white w-fit px-4 py-2 rounded-lg'>Subir más</button>
          </section>
    }
    </section>
  )
}
