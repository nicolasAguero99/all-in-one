'use client'

import { useState } from 'react'
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

// Services
import { addUrlsShortenedCookies } from '@/lib/services'

// Icons
import PasteIcon from './icons/paste-icon'
import CrossIcon from './icons/cross-icon'

export default function UrlForm ({ urlsUploaded }: { urlsUploaded: Array<{ url: string, longUrl: string }> }): JSX.Element {
  const router = useRouter()
  const [url, setUrl] = useState('')
  const [isPasted, setIsPasted] = useState(false)
  const [clearEnabled, setClearEnabled] = useState(false)
  const { user } = userStore((state) => ({
    user: state.user
  }), shallow)

  const { register, setValue, handleSubmit, formState: { errors } } = useForm<z.infer<typeof inputUrl>>({
    resolver: zodResolver(inputUrl)
  })

  const onSubmit = async (data: z.infer<typeof inputUrl>): Promise<void> => {
    const { longUrl } = data
    const res = await fetch(`${API_URL}/urls`, {
      method: 'POST',
      body: JSON.stringify({ longUrl, userId: user.uid })
    })
    const shortUrl: string = await res.json()
    console.log(shortUrl)
    if (user.uid === '') {
      await addUrlsShortenedCookies(shortUrl)
    }
    setUrl(shortUrl)
    router.refresh()
  }

  const handleType = (e: React.ChangeEvent<HTMLInputElement>): void => {
    e.target.value === '' ? setClearEnabled(false) : setClearEnabled(true)
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

  return (
    <section className='flex flex-col justify-center'>
      <h2 className='text-4xl text-center'>Acortador url</h2>
      <form onSubmit={handleSubmit(onSubmit)} method='post' className='flex flex-col justify-center items-center gap-2 my-4'>
        <div className='flex gap-4'>
          <div className='relative'>
            <input className={`${clearEnabled ? 'ps-10' : 'ps-4'} pe-10 bg-slate-200 text-black py-2 rounded-lg transition-all ease-out duration-300`} type='text' placeholder="https://link-largo-de-ejemplo" {...register('longUrl')} onChange={handleType} />
            {
              clearEnabled
                ? <button onClick={handleClear} className='absolute top-[6px] left-1 text-white' type='button'><CrossIcon /></button>
                : <button onClick={handlePaste} className='absolute top-[5px] right-1 text-white' type='button'><PasteIcon isPasted={isPasted} /></button>
            }
          </div>
          <button className='bg-blue-600 text-white w-fit px-4 py-2 rounded-lg' type='submit'>Acortar</button>
        </div>
        {errors.longUrl?.message != null && <span className='text-red-600'>{String(errors.longUrl?.message)}</span>}
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
