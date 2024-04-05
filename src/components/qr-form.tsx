'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { type z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'
import { shallow } from 'zustand/shallow'
import QRCode from 'react-qr-code'
import JSConfetti from 'js-confetti'

// Schema
import { inputUrl } from '@/schema/zod'

// Constants
import { API_URL, SERVICES_DATA } from '@/constants/constants'

// Store
import { userStore } from '@/store/userStore'
import { errorStore } from '@/store/errorStore'

// Components
import ActionButtonsLink from './action-buttons-urls'
import RobotError from './robot-error'

// Icons
import PasteIcon from './icons/paste-icon'
import CrossIcon from './icons/cross-icon'

// Icons
import DownloadIcon from './icons/download-icon'
import SendIcon from './icons/send-icon'

export default function QrForm ({ qrsUrl, children }: { qrsUrl: Array<{ qr: string, url: string }>, children: JSX.Element[] }): JSX.Element {
  const router = useRouter()
  const [url, setUrl] = useState('')
  const [qr, setQr] = useState('')
  const [isPasted, setIsPasted] = useState(false)
  const [clearEnabled, setClearEnabled] = useState(false)
  const [showModalConfirm, setShowModalConfirm] = useState(false)
  const [isUploading, setUploading] = useState(false)
  const qrCodeRef = useRef<any>(null)

  const { user, tokens } = userStore((state) => ({
    user: state.user,
    tokens: state.tokens
  }), shallow)

  const { setError } = errorStore()

  const { register, setValue, getValues, handleSubmit, setError: setErrorForm, formState: { errors } } = useForm<z.infer<typeof inputUrl>>({
    resolver: zodResolver(inputUrl)
  })

  useEffect(() => {
    if (user.uid !== '') {
      Number(tokens) < 1 && setError('No tienes tokens suficientes')
      if (errors.longUrl?.message != null) {
        setShowModalConfirm(false)
        setError(errors.longUrl?.message)
        return
      }
      setError(errors.longUrl?.message ?? '')
    } else {
      setError('Debes iniciar sesión')
    }
  }, [user.uid, tokens, errors.longUrl?.message])

  useEffect(() => {
    if (qr === '') return
    const confetti = async (): Promise<void> => {
      const jsConfetti = new JSConfetti()
      await jsConfetti.addConfetti()
    }
    void confetti()
  }, [qr])

  const onSubmit = async (data: z.infer<typeof inputUrl>): Promise<void> => {
    setQr('')
    setShowModalConfirm(false)
    setUploading(true)
    const { longUrl } = data
    const res = await fetch(`${API_URL}/qrs`, {
      method: 'POST',
      body: JSON.stringify({ longUrl, userId: user.uid })
    })
    if (res.status === 400) {
      const { error } = await res.json() as { error: string } ?? { error: 'Ha ocurrido un error' }
      // showNotification(error, 'error')
      setError(error)
      setUploading(false)
      return
    }
    const shortUrl: string = await res.json()
    setQr(shortUrl)
    setUploading(false)
    setValue('longUrl', '')
    setClearEnabled(false)
    router.refresh()
  }

  const handleCloseQr = (): void => {
    setQr('')
  }

  const handleShowModal = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault()
    setShowModalConfirm(true)
    const url = getValues('longUrl')
    try {
      inputUrl.parse({ longUrl: url })
      if (errors.longUrl?.message != null) setErrorForm('longUrl', { message: '' })
    } catch (error) {
      const { message } = (error as { errors: [{ message: string }] }).errors[0] ?? { message: 'Ha ocurrido un error' }
      setErrorForm('longUrl', { message })
      setShowModalConfirm(false)
    }
  }

  const handleType = (e: React.ChangeEvent<HTMLInputElement>): void => {
    e.target.value === '' ? setClearEnabled(false) : setClearEnabled(true)
    setUrl(e.target.value)
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
    setClearEnabled(false)
  }

  const handleDownloadQRCode = (qrName: string, urlName: string): void => {
    if (qrCodeRef.current == null) return
    const svgString = qrCodeRef.current.outerHTML
    const urlNameFormatted = urlName.split('/')[2]
    const extensionFile = 'jpg'
    const fileName = `${urlNameFormatted}-${qrName}.${extensionFile}`
    const blob = new Blob([svgString], { type: 'image/svg+xml' })
    const blobUrl = URL.createObjectURL(blob)
    // Svg to canvas to image
    const img = new Image()
    img.src = blobUrl
    img.onload = () => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      canvas.width = img.width
      canvas.height = img.height
      ctx?.drawImage(img, 0, 0)
      const a = document.createElement('a')
      a.download = fileName
      a.href = canvas.toDataURL('image/png')
      a.click()
      canvas.remove()
      img.remove()
      URL.revokeObjectURL(blobUrl)
    }
  }

  return (
    <main className='flex flex-col justify-center gap-4 py-6 px-6'>
      <RobotError />
      <h1 className='text-xl font-semibold text-center'>¿Qué vamos a hacer hoy?</h1>
      {children}
      {
        qr === '' && <QRCode className='m-auto' value={url} size={180} />
      }
      {
        showModalConfirm &&
        <>
          <div onClick={() => { setShowModalConfirm(false) }} className='fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 z-40 cursor-pointer' />
          <div className='w-3/5 h-[250px] flex flex-col justify-center fixed top-0 left-0 right-0 bottom-0 m-auto px-4 py-4 rounded-lg shadow-lg shadow-[#ffffff]/5 bg-bckg z-50'>
            {
              user.uid !== ''
                ? <>
                    <div className='flex flex-col gap-4 items-center'>
                      <span className='text-3xl font-semibold'>Generar qr</span>
                      <p className='text-white/60'>¿Estás seguro de generar qr? Gastarás 1 token</p>
                    </div>
                    <div className='flex justify-center items-center gap-6 mt-10'>
                      <button className='bg-bckg text-primary border-[1px] border-r-primary py-2 px-4 rounded-lg' onClick={() => { setShowModalConfirm(false) }}>Cancelar</button>
                      <button className='bg-primary text-bckg py-2 px-4 rounded-lg' onClick={handleSubmit(onSubmit)}>Aceptar</button>
                    </div>
                  </>
                : <>
                    <div className='flex flex-col gap-4 items-center'>
                      <span className='text-3xl font-semibold'>Iniciar sesión</span>
                      <p className='text-white/60'>Para realizar esta operación debes iniciar sesión y obtener tokens</p>
                    </div>
                    <div className='flex justify-center items-center gap-6 mt-10'>
                      <button className='bg-primary text-bckg font-medium py-2 px-4 rounded-lg' onClick={() => { setShowModalConfirm(false) }}>Aceptar</button>
                    </div>
                  </>
            }
          </div>
        </>
      }
      {
        qr !== ''
          ? <div className='relative w-fit h-fit flex flex-col gap-6 m-auto px-14 py-6'>
              <QRCode className='m-auto' value={url} size={200} />
              <div className='flex items-center gap-4'>
                <button className='bg-bckg text-primary font-medium w-fit px-4 py-2 rounded-lg' onClick={() => { handleDownloadQRCode(qr, url) }}>
                  Descargar
                </button>
                <button className='bg-bckg text-primary font-medium w-fit px-4 py-2 rounded-lg' onClick={handleCloseQr}>
                  Generar otro
                </button>
              </div>
            </div>
          : <form onSubmit={handleShowModal} method='post' className='flex flex-col justify-center items-center gap-2 mt-4 mb-12'>
            <div className='relative w-full max-w-[800px] flex gap-4'>
              <div className='w-full relative after:absolute after:top-3 after:-left-1 after:px-11 after:py-2 after:bg-bckg after:w-[calc(100%+10px)] after:h-full after:border-[1px] after:border-primary after:rounded-full'>
                <input className='w-full h-[42px] relative bg-primary text-secondary py-2 ps-10 max-[500px]:ps-4 max-[500px]:text-sm  rounded-full border-[1px] border-primary transition-all ease-out duration-300 z-20' disabled={user?.uid === ''} type='text' placeholder="https://link-de-ejemplo" {...register('longUrl')} onChange={handleType} />
                {
                  clearEnabled
                    ? <button onClick={handleClear} className='max-[500px]:hidden absolute top-[6px] left-1 text-white z-30' type='button'><CrossIcon /></button>
                    : <button onClick={handlePaste} className='max-[500px]:hidden absolute top-[5px] left-1 text-white z-30' type='button' disabled={user?.uid === ''}><PasteIcon isPasted={isPasted} /></button>
                }
              </div>
              <button className='max-[499px]:hidden absolute top-[1px] right-[1px] w-fit h-[40px] bg-bckg text-white px-8 py-2 rounded-full z-30 disabled:bg-disable disabled:cursor-not-allowed' type='submit' disabled={user?.uid === '' || showModalConfirm || isUploading}>{!isUploading ? 'Generar' : 'Generando...'}</button>
              <button className='min-[500px]:hidden absolute top-[1px] right-[1px] w-fit h-[40px] bg-bckg text-white px-8 py-2 rounded-full z-30 disabled:bg-disable disabled:cursor-not-allowed' type='submit' disabled={user?.uid === '' || showModalConfirm || isUploading}><SendIcon /></button>
            </div>
          </form>
      }
      {
        user?.uid === ''
          ? null
          : <section className='flex flex-col gap-4 w-full max-w-[1000px] bg-bckg m-auto rounded-lg shadow-md shadow-[#ffffff]/5 p-6 mt-6'>
          <h2 className='flex gap-2 items-center text-xl font-semibold'>
            <img src="/icons/qr-icon.svg" alt="qr icon" />
            QRs recientes
          </h2>
          {
            qrsUrl.length > 0
              ? <ul className='flex flex-wrap justify-center items-center gap-4 px-16 my-6'>
                  {
                    qrsUrl.map(eachQr => {
                      const urlDivided = eachQr.url.split('/')
                      const urlHostFormatted = urlDivided[2]
                      const urlPathFormatted = urlDivided[3]

                      return (
                        <li key={eachQr.qr} className='relative flex flex-col overflow-hidden rounded-t-lg w-[250px] h-fit'>
                          <Link href={`/${eachQr.url}`} className='flex justify-center items-center p-4 rounded-t-lg'>
                            <QRCode value={eachQr.url ?? ''} size={200} ref={qrCodeRef} className='hover:scale-110 transition-all duration-300 ease-out' />
                          </Link>
                            <div className='relative flex flex-col gap-2 p-4 pt-8 bg-primary rounded-b-lg z-20'>
                              <span className='text-black font-semibold'>{urlHostFormatted}</span>
                              <small className='text-gray-600 text-sm h-6'>{urlPathFormatted}</small>
                              <div className='flex justify-between items-center gap-4'>
                                <ActionButtonsLink url={eachQr.qr} service={SERVICES_DATA[2].value} />
                                <button className='shadow-md rounded-lg p-1 [&>svg]:size-6' onClick={() => { handleDownloadQRCode(eachQr.qr, eachQr.url) }}><DownloadIcon /></button>
                              </div>
                            </div>
                        </li>
                      )
                    })
                  }
                </ul>
              : <span className='text-center text-xl text-primary/50 py-6'>No hay QRs generados</span>
          }
        </section>
      }
    </main>
  )
}
