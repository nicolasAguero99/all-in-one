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
import { API_URL, SERVICES_DATA } from '@/constants/constants'

// Store
import { userStore } from '@/store/userStore'
import { errorStore } from '@/store/errorStore'

// Components
import ActionButtonsLink from './action-buttons-urls'

// Services
import { addUrlsShortenedCookies, isExistUrl } from '@/lib/services'

// Icons
import PasteIcon from './icons/paste-icon'
import CrossIcon from './icons/cross-icon'
import SendIcon from './icons/send-icon'

// Utils
import { showNotification } from '@/lib/utils'

// Types
import { TypesServices } from '@/types/types.d'

export default function UrlForm ({ urlsUploaded }: { urlsUploaded: Array<{ url: string, longUrl: string }> }): JSX.Element {
  const router = useRouter()
  const [url, setUrl] = useState('')
  const [currentLongUrl, setCurrentLongUrl] = useState('')
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

  const { setError } = errorStore()

  const { register, setValue, getValues, handleSubmit, setError: setErrorForm, formState: { errors } } = useForm<z.infer<typeof inputUrl>>({
    resolver: zodResolver(inputUrl)
  })

  useEffect(() => {
    if (typeof window === 'undefined') return
    setCurrentOrigin(window.location.origin)
  }, [])

  useEffect(() => {
    errors.customUrl?.message != null && setShowModalConfirm(false)
    if (errors.longUrl?.message != null) {
      setShowModalConfirm(false)
      setError(errors.longUrl?.message)
      return
    }
    setError(errors.longUrl?.message ?? '')
  }, [errors.longUrl?.message, errors.customUrl?.message])

  useEffect(() => {
    if (errors.customUrl?.message != null) {
      setError(errors.customUrl?.message)
    } else {
      setError(errors.customUrl?.message ?? '')
    }
  }, [errors.customUrl?.message])

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
    if (user.uid === '') {
      await addUrlsShortenedCookies(shortUrl)
    }
    setUrl(shortUrl)
    setCurrentLongUrl(longUrl)
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
      if (errors.longUrl?.message != null) {
        setErrorForm('longUrl', { message: '' })
        setError('')
      }
    } catch (error) {
      const { message } = (error as { errors: [{ message: string }] }).errors[0] ?? { message: 'Ha ocurrido un error' }
      setErrorForm('longUrl', { message })
      setError(message)
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
    const isValid = await isExistUrl(e.target.value, TypesServices.URL)
    setIsValidateCustomUrl(isValid)
    isValid ? setError('') : setError('Url no disponible')
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
      {
        showModalConfirm &&
        <>
          <div onClick={() => { setShowModalConfirm(false) }} className='fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 z-40 cursor-pointer' />
          <div className='w-3/5 h-[250px] flex flex-col justify-center fixed top-0 left-0 right-0 bottom-0 m-auto px-4 py-4 rounded-lg shadow-lg shadow-[#ffffff]/5 bg-bckg z-50'>
            {
              user.uid !== ''
                ? <div>
                    <div className='flex flex-col gap-4 items-center'>
                      <span className='text-3xl font-semibold'>Acortar url</span>
                      <p className='text-white/60'>¿Estás seguro de acortar url? Gastarás 1 token</p>
                    </div>
                    <div className='flex justify-center items-center gap-6 mt-10'>
                      <button className='bg-bckg text-primary border-[1px] border-r-primary py-2 px-4 rounded-lg' onClick={() => { setShowModalConfirm(false) }}>Cancelar</button>
                      <button className='bg-primary text-bckg py-2 px-4 rounded-lg' onClick={handleSubmit(onSubmit)}>Aceptar</button>
                    </div>
                  </div>
                : <div>
                   <div className='flex flex-col gap-4 items-center'>
                      <span className='text-3xl font-semibold'>Iniciar sesión</span>
                      <p className='text-white/60'>Para realizar esta operación debes iniciar sesión y obtener tokens</p>
                    </div>
                    <div className='flex justify-center items-center gap-6 mt-10'>
                      <button className='bg-primary text-bckg font-medium py-2 px-4 rounded-lg' onClick={() => { setShowModalConfirm(false) }}>Aceptar</button>
                    </div>
                  </div>
            }
          </div>
        </>
      }
      <form onSubmit={(!enabledCustomUrl && customUrl === '') ? handleSubmit(onSubmit) : handleShowModal} method='post' className='flex flex-col justify-center items-center gap-2 mt-4 mb-12'>
        <div className='flex w-full max-w-[800px] gap-4'>
          <div className='relative w-full'>
            <input className='w-full h-[42px] relative bg-primary text-secondary py-2 ps-10 max-[500px]:ps-4 max-[500px]:text-sm rounded-full border-[1px] border-primary transition-all ease-out duration-300 z-20' type='text' placeholder="https://link-largo-de-ejemplo" {...register('longUrl')} onChange={handleType} />
            <div className={`${clearEnabled ? 'top-9' : 'top-4'} absolute -left-1 w-full flex transition-all ease-out duration-300 z-10`}>
              <div className={`${clearEnabled ? '[&>*]:opacity-100' : '[&>*]:opacity-0'} relative w-full`}>
                <input className='absolute top-[19px] left-[16px] size-4 shadow-lg z-30 cursor-pointer transition-all ease-out duration-300' type="checkbox" onChange={handleCheckCustomUrl} />
                <input className={`${clearEnabled ? 'pt-4 pb-3 disabled:opacity-50 text-primary' : 'disabled:opacity-100 placeholder:text-transparent text-transparent'} relative size-full px-11 py-2 bg-bckg w-[calc(100%+10px)] h-full max-[500px]:text-sm border-[1px] border-primary rounded-full transition-all ease-out duration-300 z-10 disabled:opacity-50`} type='text' placeholder='URL personalizado' disabled={!enabledCustomUrl} {...register('customUrl')} onChange={handleCustomUrl} value={customUrl} />
              </div>
            </div>
            {
              clearEnabled
                ? <button onClick={handleClear} className='max-[500px]:hidden absolute top-[7px] left-2 text-white z-30' type='button'><CrossIcon /></button>
                : <button onClick={handlePaste} className='max-[500px]:hidden absolute top-[5px] left-2 text-white z-30' type='button'><PasteIcon isPasted={isPasted} /></button>
            }
            <button className='max-[499px]:hidden absolute top-[1px] right-[1px] w-fit h-[40px] bg-bckg text-white px-8 py-2 rounded-full z-30 disabled:bg-disable' type='submit' disabled={showModalConfirm || isUploading || isValidateCustomUrl === 'pending'}>{!isUploading ? 'Acortar' : 'Acortando...'}</button>
            <button className='min-[500px]:hidden absolute top-[1px] right-[1px] w-fit h-[40px] bg-bckg text-white px-4 py-2 rounded-full z-30 disabled:bg-disable' type='submit' disabled={showModalConfirm || isUploading || isValidateCustomUrl === 'pending'}><SendIcon /></button>
          </div>
        </div>
        {
          enabledCustomUrl &&
          <div className='flex flex-col justify-center items-center text-lg pt-20
          '>
            <div className='flex items-center'>
              <span className='text-tertiary'>{currentOrigin}/</span><span className={`${isValidateCustomUrl === true ? 'text-green-500' : 'text-red-500'}`}>{customUrl}</span>
            </div>
          </div>
        }
      </form>
      {
        url !== '' && (
          <div className='flex flex-col items-center justify-center gap-2 my-8'>
            <span className='text-xl font-semibold'>Nueva URL:</span>
            <Link className='underline text-tertiary' href={`/${url}`} >{currentOrigin}/{url}</Link>
            <small className='text-sm text-tertiary'>({currentLongUrl})</small>
          </div>
        )
      }
      <section className='flex flex-col gap-4 w-full max-w-[1000px] bg-bckg m-auto rounded-lg shadow-md shadow-[#ffffff]/5 p-6 mt-6'>
        <h2 className='flex gap-1 items-center text-xl font-semibold'>
          <img src="/icons/url-icon.svg" alt="url icon" />
          URLs recientes
        </h2>
        {
          urlsUploaded.length > 0
            ? <ul className='flex flex-col gap-10 my-6 px-2'>
                {
                  urlsUploaded.map(eachUrl => (
                    <li key={eachUrl.url} className='flex justify-between items-center gap-4 text-tertiary'>
                      <Link href={`/${eachUrl.url}`} className='text-sm underline w-[320px] whitespace-nowrap overflow-x-hidden text-ellipsis'>{eachUrl.longUrl}</Link>
                      <small className='text-sm'>/{eachUrl.url}</small>
                      <ActionButtonsLink url={eachUrl.url} setUrl={setUrl} service={SERVICES_DATA[0].value} />
                    </li>
                  ))
                }
              </ul>
            : <span className='text-center sm:text-lg text-primary/50 py-6'>No hay URLs acortados</span>
        }
      </section>
    </section>
  )
}
