'use client'

import { useState } from 'react'
import { type z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

// Schema
import { inputUrl } from '@/schema/zod'

// Constants
import { API_URL } from '@/constants/constants'
import Link from 'next/link'

export default function UrlForm (): JSX.Element {
  const [url, setUrl] = useState('')

  const { register, handleSubmit, formState: { errors } } = useForm<z.infer<typeof inputUrl>>({
    resolver: zodResolver(inputUrl)
  })

  const onSubmit = async (data: z.infer<typeof inputUrl>): Promise<void> => {
    const { longUrl } = data

    console.log('longUrl', longUrl)

    const res = await fetch(`${API_URL}/urls`, {
      method: 'POST',
      body: JSON.stringify({ longUrl })
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
    </section>
  )
}
