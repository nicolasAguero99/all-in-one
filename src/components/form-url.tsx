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
import ActionButtonsLink from './action-buttons-link'

export default function UrlForm ({ urlsUploaded }: { urlsUploaded: Array<{ url: string, longUrl: string }> }): JSX.Element {
  const router = useRouter()
  const [url, setUrl] = useState('')
  // const [myUrls, setMyUrls] = useState<string[]>([])
  const { user } = userStore((state) => ({
    user: state.user
  }), shallow)

  const { register, handleSubmit, formState: { errors } } = useForm<z.infer<typeof inputUrl>>({
    resolver: zodResolver(inputUrl)
  })

  const onSubmit = async (data: z.infer<typeof inputUrl>): Promise<void> => {
    const { longUrl } = data

    console.log('longUrl', longUrl)

    const res = await fetch(`${API_URL}/urls`, {
      method: 'POST',
      body: JSON.stringify({ longUrl, userId: user.uid })
    })
    const shortUrl: string = await res.json()
    console.log(shortUrl)
    setUrl(shortUrl)
    router.refresh()
  }

  return (
    <section className='flex flex-col justify-center'>
      <h2 className='text-4xl text-center'>Acortador url</h2>
      <form onSubmit={handleSubmit(onSubmit)} method='post' className='flex flex-wrap justify-center gap-2 my-4'>
        <input className='bg-slate-200 px-4' type='text' placeholder="https://link-largo-de-ejemplo" {...register('longUrl')} />
        {errors.longUrl?.message != null && <span>{String(errors.longUrl?.message)}</span>}
        <button className='bg-blue-600 text-white w-fit px-4 py-2 rounded-lg' type='submit'>Acortar</button>
      </form>
      {
        url !== '' && (
          <div>
            <span>Nueva url:</span>
            <Link className='underline text-blue-600' href={`/${url}`} >{url}</Link>
          </div>
        )
      }
      <section className='flex flex-col items-center gap-4'>
        <h2>Mis urls</h2>
        <ul className='flex flex-col gap-10 my-6'>
          {
            urlsUploaded.map(eachUrl => (
              <li key={eachUrl.url} className='flex flex-col gap-2'>
                <div className='flex justify-between items-center gap-4'>
                  <Link href={`/${eachUrl.url}`} className='text-sky-200 underline'>{eachUrl.url}</Link>
                  <ActionButtonsLink url={eachUrl.url} />
                </div>
                <small className='text-gray-400 text-sm'>({eachUrl.longUrl})</small>
              </li>
            ))
          }
        </ul>
      </section>
    </section>
  )
}
