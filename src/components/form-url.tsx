'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { type z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'
import { shallow } from 'zustand/shallow'

// Schema
import { inputUrl } from '@/schema/zod'

// Constants
import { API_URL } from '@/constants/constants'

// Store
import { userStore } from '@/store/userStore'

// Components
import ActionButtonsLink from './action-buttons-urls'
import PaymentBtn from './payment-btn'

// Services
import { addUrlsShortenedCookies, isExistUrl } from '@/lib/services'

// Icons
import PasteIcon from './icons/paste-icon'
import CrossIcon from './icons/cross-icon'
import { showNotification } from '@/lib/utils'

export default function UrlForm ({ urlsUploaded }: { urlsUploaded: Array<{ url: string, longUrl: string }> }): JSX.Element {
  const router = useRouter()
  const [url, setUrl] = useState('')
  const [isPasted, setIsPasted] = useState(false)
  const [clearEnabled, setClearEnabled] = useState(false)
  const [currentOrigin, setCurrentOrigin] = useState('')
  const [customUrl, setCustomUrl] = useState('')
  const [enabledCustomUrl, setEnabledCustomUrl] = useState(false)
  const [isValidateCustomUrl, setIsValidateCustomUrl] = useState<boolean | 'pending'>(false)
  const [showModalConfirm, setShowModalConfirm] = useState(false)
  const [isUploading, setUploading] = useState(false)

  const { user } = userStore((state) => ({
    user: state.user
  }), shallow)

  const { register, setValue, getValues, handleSubmit, setError, formState: { errors } } = useForm<z.infer<typeof inputUrl>>({
    resolver: zodResolver(inputUrl)
  })

  useEffect(() => {
    if (typeof window === 'undefined') return
    setCurrentOrigin(window.location.origin)
  }, [])

  useEffect(() => {
    if (errors.longUrl?.message != null) setShowModalConfirm(false)
  }, [errors.longUrl?.message])

  const onSubmit = async (data: z.infer<typeof inputUrl>): Promise<void> => {
    setShowModalConfirm(false)
    setUploading(true)
    const { longUrl } = data
    const res = await fetch(`${API_URL}/urls`, {
      method: 'POST',
      body: JSON.stringify({ longUrl, userId: user.uid, customUrl })
    })
    if (res.status === 400) {
      const { error } = await res.json() as { error: string } ?? { error: 'Ha ocurrido un error' }
      showNotification(error, 'error')
      setUploading(false)
      return
    }
    const shortUrl: string = await res.json()
    console.log(shortUrl)
    if (user.uid === '') {
      await addUrlsShortenedCookies(shortUrl)
    }
    setUrl(shortUrl)
    setUploading(false)
    router.refresh()
  }

  const handleShowModal = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault()
    if (isValidateCustomUrl === false && enabledCustomUrl) return
    setShowModalConfirm(true)
    const url = getValues('longUrl')
    try {
      inputUrl.parse({ longUrl: url })
      if (errors.longUrl?.message != null) setError('longUrl', { message: '' })
    } catch (error) {
      const { message } = (error as { errors: [{ message: string }] }).errors[0] ?? { message: 'Ha ocurrido un error' }
      setError('longUrl', { message })
      setShowModalConfirm(false)
    }
  }

  const handleType = (e: React.ChangeEvent<HTMLInputElement>): void => {
    e.target.value === '' ? setClearEnabled(false) : setClearEnabled(true)
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

  const handlePaste = async (): Promise<void> => {
    const text = await navigator.clipboard.readText()
    setValue('longUrl', text)
    setIsPasted(true)
    setTimeout(() => {
      setIsPasted(false)
    }, 3000)
  }

  const handleClear = (): void => {
    setValue('longUrl', '')
    setValue('customUrl', '')
    setClearEnabled(false)
  }

  return (
    <section className='flex flex-col justify-center'>
      <PaymentBtn />
      {
        showModalConfirm &&
        <>
          <div onClick={() => { setShowModalConfirm(false) }} className='fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 z-40 cursor-pointer' />
          <div className='absolute inset-0 w-1/2 h-fit m-auto flex flex-col items-center gap-6 py-8 bg-slate-500 rounded-lg z-50'>
            {
              user.uid !== ''
                ? <>
                    <div className='flex flex-col gap-6 items-center'>
                      <span className='text-3xl font-semibold'>Acortar url</span>
                      <p className='text-white/60'>¿Estás seguro de acortar la url? {(enabledCustomUrl && customUrl !== '') && 'Gastarás 1 token'}</p>
                    </div>
                    <div className='flex justify-between items-center gap-4'>
                      <button className='text-blue-600 bg-white w-fit px-4 py-2 rounded-lg' onClick={() => { setShowModalConfirm(false) }}>Cancelar</button>
                      <button className='bg-blue-600 text-white w-fit px-4 py-2 rounded-lg' onClick={handleSubmit(onSubmit)}>Aceptar</button>
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
      <form onSubmit={(!enabledCustomUrl && customUrl === '') ? handleSubmit(onSubmit) : handleShowModal} method='post' className='flex flex-col justify-center items-center gap-2 mt-4 mb-12'>
        <div className='flex gap-4'>
          <div className='relative'>
            <input className={`${clearEnabled ? 'ps-10' : 'ps-4'} shadow-md relative pe-10 bg-slate-200 text-black py-2 rounded-lg transition-all ease-out duration-300 z-20`} type='text' placeholder="https://link-largo-de-ejemplo" {...register('longUrl')} onChange={handleType} />
            <div className={`${clearEnabled ? 'top-7 opacity-100' : 'top-0 opacity-0'} absolute right-0 flex transition-all ease-out duration-300`}>
              <div className='relative'>
                <input className='absolute top-5 left-[10px] size-4 shadow-lg z-30 cursor-pointer' type="checkbox" onChange={handleCheckCustomUrl} />
                <input className='shadow-md relative w-full flex-1 h-full px-10 bg-slate-200 text-black pt-4 pb-2 rounded-b-lg transition-all ease-out duration-300 z-10 disabled:opacity-50' type='text' placeholder='Url personalizado' disabled={!enabledCustomUrl} {...register('customUrl')} onChange={handleCustomUrl} value={customUrl} />
              </div>
            </div>
            {
              clearEnabled
                ? <button onClick={handleClear} className='absolute top-[6px] left-1 text-white z-30' type='button'><CrossIcon /></button>
                : <button onClick={handlePaste} className='absolute top-[5px] right-1 text-white z-30' type='button'><PasteIcon isPasted={isPasted} /></button>
            }
          </div>
          <button className='bg-blue-600 text-white w-fit px-4 py-2 rounded-lg disabled:opacity-30' type='submit' disabled={showModalConfirm || isUploading || isValidateCustomUrl === 'pending'}>{!isUploading ? 'Acortar' : 'Acortando...'}</button>
        </div>
        <div className='flex flex-col justify-center items-center mt-10'>
          {errors.longUrl?.message != null && <span className='text-red-600'>{String(errors.longUrl?.message)}</span>}
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
      </form>
      {
        url !== '' && (
          <div className='flex justify-center gap-2 my-6'>
            <span>Nueva url:</span>
            <Link className='underline text-blue-600' href={`/${url}`} >{url}</Link>
          </div>
        )
      }
      <section className='flex flex-col items-center gap-4'>
        <h2>Mis urls</h2>
        {
          urlsUploaded.length > 0
            ? <ul className='flex flex-col gap-10 my-6'>
                {
                  urlsUploaded.map(eachUrl => (
                    <li key={eachUrl.url} className='flex flex-col gap-2'>
                      <div className='flex justify-between items-center gap-4'>
                        <Link href={`/${eachUrl.url}`} className='text-sky-200 underline'>{eachUrl.url}</Link>
                        <ActionButtonsLink url={eachUrl.url} setUrl={setUrl} />
                      </div>
                      <small className='text-gray-400 text-sm'>({eachUrl.longUrl})</small>
                    </li>
                  ))
                }
              </ul>
            : <span>No hay links acortados</span>
        }
      </section>
    </section>
  )
}
