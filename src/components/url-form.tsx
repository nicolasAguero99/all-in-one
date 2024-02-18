'use client'

import { useEffect, useState } from 'react'
import { type z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'

// Schema
import { inputUrl } from '@/schema/zod'

// Constants
import { API_URL } from '@/constants/constants'

export default function UrlForm ({ userId }: { userId: string }): JSX.Element {
  const [url, setUrl] = useState('')
  const [myUrls, setMyUrls] = useState<string[]>([])

  const { register, handleSubmit, formState: { errors } } = useForm<z.infer<typeof inputUrl>>({
    resolver: zodResolver(inputUrl)
  })

  useEffect(() => {
    const getUrls = async (): Promise<void> => {
      if (userId === '') return
      const res = await fetch(`${API_URL}/urls/${userId}`, {
        method: 'GET'
      })
      const data: any[] = await res.json()
      console.log(data)
      Array.isArray(data) && setMyUrls(data)
    }

    void getUrls()
  }, [userId])

  const onSubmit = async (data: z.infer<typeof inputUrl>): Promise<void> => {
    const { longUrl } = data

    console.log('longUrl', longUrl)

    const res = await fetch(`${API_URL}/urls`, {
      method: 'POST',
      body: JSON.stringify({ longUrl, userId })
    })
    const shortUrl: string = await res.json()
    console.log(shortUrl)
    setUrl(shortUrl)
  }

  return (
    <section>
      <form onSubmit={handleSubmit(onSubmit)} method='post'>
        <input className='bg-slate-200' type='text' placeholder="https://link-largo-de-ejemplo" {...register('longUrl')} />
        {errors.longUrl?.message != null && <span>{String(errors.longUrl?.message)}</span>}
        <button type='submit'>Acortar</button>
      </form>
      {
        url !== '' && (
          <div>
            <span>Nueva url:</span>
            <Link href={`/${url}`} >Url</Link>
          </div>
        )
      }
      <div>
        <h2>Mis urls</h2>
        <ul>
          {
            myUrls.map((url, index) => (
              <li key={index} className='text-blue-500 underline'>
                <Link href={`/${url}`} >{url}</Link>
              </li>
            ))
          }
        </ul>
      </div>
    </section>
  )
}
