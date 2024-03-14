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

// Components
import ActionButtonsLink from './action-buttons-urls'
import PaymentBtn from './payment-btn'

// Icons
import PasteIcon from './icons/paste-icon'
import CrossIcon from './icons/cross-icon'

// Utils
import { showNotification } from '@/lib/utils'

// Icons
import DownloadIcon from './icons/download-icon'

export default function QrForm ({ qrsUrl }: { qrsUrl: Array<{ qr: string, url: string }> }): JSX.Element {
  const router = useRouter()
  const [url, setUrl] = useState('')
  const [qr, setQr] = useState('')
  const [isPasted, setIsPasted] = useState(false)
  const [clearEnabled, setClearEnabled] = useState(false)
  const [showModalConfirm, setShowModalConfirm] = useState(false)
  const [isUploading, setUploading] = useState(false)
  const qrCodeRef = useRef<any>(null)

  const { user } = userStore((state) => ({
    user: state.user
  }), shallow)

  const { register, setValue, getValues, handleSubmit, setError, formState: { errors } } = useForm<z.infer<typeof inputUrl>>({
    resolver: zodResolver(inputUrl)
  })

  useEffect(() => {
    if (errors.longUrl?.message != null) setShowModalConfirm(false)
  }, [errors.longUrl?.message])

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
      showNotification(error, 'error')
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
      if (errors.longUrl?.message != null) setError('longUrl', { message: '' })
    } catch (error) {
      const { message } = (error as { errors: [{ message: string }] }).errors[0] ?? { message: 'Ha ocurrido un error' }
      setError('longUrl', { message })
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
    console.log('blob', blob)
    const blobUrl = URL.createObjectURL(blob)

    console.log('blobUrl', blobUrl)

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
    <section className='flex flex-col justify-center gap-2 px-6'>
      <h1 className='text-6xl font-semibold text-center'>Generar Qr</h1>
      <PaymentBtn />
      {
        qr === '' && <QRCode className='m-auto' value={url} size={200} />
      }
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
                      <p className='text-white/60'>¿Estás seguro de acortar la url? Gastarás 1 token</p>
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
      {
        qr !== ''
          ? <div className='relative w-fit h-fit flex flex-col gap-6 m-auto px-14 py-6'>
              <QRCode className='m-auto' value={url} size={200} />
              <div className='flex items-center gap-4'>
                <button className='bg-blue-600 text-white w-fit px-4 py-2 rounded-lg' onClick={() => { handleDownloadQRCode(qr, url) }}>
                  Descargar
                </button>
                <button className='bg-blue-600 text-white w-fit px-4 py-2 rounded-lg' onClick={handleCloseQr}>
                  Generar otro
                </button>
              </div>
            </div>
          : <form onSubmit={handleShowModal} method='post' className='flex flex-col justify-center items-center gap-2 mt-4 mb-12'>
            <div className='flex gap-4'>
              <div className='relative'>
                <input className={`${clearEnabled ? 'ps-10' : 'ps-4'} shadow-md relative pe-10 bg-slate-200 text-black py-2 rounded-lg transition-all ease-out duration-300 z-20`} type='text' placeholder="https://link-de-ejemplo" {...register('longUrl')} onChange={handleType} />
                {
                  clearEnabled
                    ? <button onClick={handleClear} className='absolute top-[6px] left-1 text-white z-30' type='button'><CrossIcon /></button>
                    : <button onClick={handlePaste} className='absolute top-[5px] right-1 text-white z-30' type='button'><PasteIcon isPasted={isPasted} /></button>
                }
              </div>
              <button className='bg-blue-600 text-white w-fit px-4 py-2 rounded-lg disabled:opacity-30' type='submit' disabled={showModalConfirm || isUploading}>{!isUploading ? 'Generar' : 'Generando...'}</button>
            </div>
            <div className='flex flex-col justify-center items-center mt-10'>
              {errors.longUrl?.message != null && <span className='text-red-600'>{String(errors.longUrl?.message)}</span>}
            </div>
          </form>
      }
      <section className='flex flex-col items-center gap-4'>
        <h2>Mis Qrs</h2>
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
                        <Link href={`/${eachQr.url}`} className='flex justify-center items-center bg-white/90 p-4 rounded-t-lg'>
                          <QRCode value={eachQr.url ?? ''} size={200} ref={qrCodeRef} className='hover:scale-110 transition-all duration-300 ease-out' />
                        </Link>
                          <div className='relative flex flex-col gap-2 p-4 pt-8 bg-slate-50 rounded-b-lg z-20'>
                            <span className='text-black font-semibold'>{urlHostFormatted}</span>
                            <small className='text-gray-600 text-sm'>{urlPathFormatted}</small>
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
            : <span>No hay qrs generados</span>
        }
      </section>
    </section>
  )
}
