'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { type z } from 'zod'
import Link from 'next/link'
import { getAuth, signInWithPopup, GoogleAuthProvider } from 'firebase/auth'

// Constants
import { API_URL } from '@/constants/constants'

// Schema
import { inputFiles } from '@/schema/zod'

// Types
import { type UserData, type FileData } from '@/types/types'

// Components
import UrlForm from '@/components/url-form'
import PaymentBtn from '@/components/payment-btn'
import PaymentModal from '@/components/payment-modal'

// Lib
import { app } from '@/lib/firebase'

// Services
import { deleteUserDataCookies, getUserDataCookies, setUserDataCookies } from '@/lib/services'

export default function App (): JSX.Element {
  const [files, setFiles] = useState<FileData[]>([])
  const [link, setLink] = useState('')
  const [fileType, setFileType] = useState('')
  const [fileName, setFileName] = useState('')
  const [tokens, setTokens] = useState<number | null>(null)
  const [user, setUser] = useState<UserData>({ name: '', email: '', photo: '', uid: '' })
  const [error, setError] = useState('')

  const auth = getAuth(app)
  const provider = new GoogleAuthProvider()

  const { register, handleSubmit, formState: { errors } } = useForm<z.infer<typeof inputFiles>>({
    resolver: zodResolver(inputFiles)
  })

  useEffect(() => {
    const getFiles = async (): Promise<void> => {
      if (user.uid === '') return
      const res = await fetch(`${API_URL}/files/${user.uid}`, {
        method: 'GET'
      })
      const data: FileData[] = await res.json()
      console.log(data)
      Array.isArray(data) && setFiles(data)
    }

    void getFiles()
  }, [user.uid])

  useEffect(() => {
    const getInitialUserData = async (): Promise<void> => {
      const data = await getUserDataCookies()
      console.log('data', data)
      if (data === undefined || user.uid !== '') return
      setUser(data)
    }
    void getInitialUserData()
  }, [])

  useEffect(() => {
    console.log('error', error)
  }, [error])

  useEffect(() => {
    const getTokens = async (): Promise<void> => {
      if (user.uid === '') return
      const res = await fetch(`${API_URL}/users/tokens/${user.uid}`, {
        method: 'GET'
      })
      const tokens: number = await res.json()
      console.log('tokens', tokens)
      if (tokens === null) return
      setTokens(tokens)
      if (Number(tokens) >= 0) {
        setError('No tienes tokens suficientes')
      }
    }
    void getTokens()
  }, [user.uid])

  const onSubmit = async (data: z.infer<typeof inputFiles>): Promise<void> => {
    if (Number(tokens) >= 0) {
      setError('No tienes tokens suficientes')
      return
    }
    if (user.uid === '') return
    const file = data.file[0] as File
    console.log('formData', file)
    const formData = new FormData()
    formData.append('file', file)
    formData.append('name', data.name)
    formData.append('userId', user.uid)
    console.log('user.uid', user.uid)
    const res = await fetch(`${API_URL}/files`, {
      method: 'POST',
      body: formData
    })
    const linkToFile: string = await res.json()
    console.log(linkToFile)
    setFileType(file.type.split('/')[0])
    setLink(linkToFile)
  }

  const handleChangeFile = (e: React.ChangeEvent<HTMLInputElement>): void => {
    if (e.target.files == null) return
    const file = e.target.files[0] ?? { name: '' }
    setFileName(file.name)
  }

  const handleShare = async (path: string): Promise<void> => {
    if (navigator.share != null) {
      await navigator.share({
        title: 'Compartir url de archivo',
        text: '¡Mirá este archivo!',
        url: `/${path}`
      })
    }
  }

  const handleLogInGoogle = async (): Promise<void> => {
    console.log('auth', auth)
    signInWithPopup(auth, provider)
      .then((result) => {
        const credential = GoogleAuthProvider.credentialFromResult(result)
        console.log('credential', credential)
        const token = credential?.accessToken
        console.log('token', token)
        const userCredentials = result.user
        console.log('result', result)
        console.log('userCredentials', userCredentials)
        const userData = {
          name: userCredentials.displayName ?? '',
          email: userCredentials.email ?? '',
          photo: userCredentials.photoURL ?? '',
          uid: userCredentials.uid ?? ''
        }
        setUser(userData)
        void setUserDataCookies(userData)
      }).catch((error) => {
        console.log('error', error)
        return error
      })
  }

  const handleLogOut = async (): Promise<void> => {
    await auth.signOut()
    await deleteUserDataCookies()
    setUser({ name: '', email: '', photo: '', uid: '' })
  }

  return (
    <div className='px-6'>
    <PaymentModal />
    {
      user.name !== ''
        ? <div className='w-fit flex gap-4 bg-slate-600 text-white items-center m-4 px-4 py-2 rounded-lg'>
            <img src={user.photo} alt={user.name} className='size-8 rounded-full' />
            <span>{user.name}</span>
            <button onClick={handleLogOut}>Cerrar sesión</button>
          </div>
        : <button onClick={handleLogInGoogle} className='bg-slate-700 text-white p-2'>Google</button>
    }
      <section>
        <h2>Acortador url</h2>
        <UrlForm userId={user.uid} />
      </section>
      <div>
        <div className='flex gap-4'>
          <span>Tienes {tokens} tokens</span>
          <PaymentBtn userId={user.uid} />
        </div>
        {
          Number(tokens) > 0
            ? <>
                {
                  error !== ''
                    ? <span>{error}</span>
                    : <form onSubmit={handleSubmit(onSubmit)} method='post' encType='multipart/form-data' className='flex flex-col gap-2 my-4'>
                      <input type='file' accept="*" {...register('file', { onChange: handleChangeFile })} />
                      {errors.file?.message != null && <span>{String(errors.file?.message)}</span>}
                      <input className='w-[350px] border-2 border-slate-500 px-4' type='text' placeholder={`${fileName !== '' ? `${fileName} (por defecto)` : 'Escribe un nombre'}`} {...register('name')} />
                      {errors.file?.message != null && <span>{String(errors.name?.message)}</span>}
                      <button className='bg-blue-400 w-fit px-4 py-2 rounded-lg' type='submit' value='Upload'>Upload</button>
                    </form>
                }
              </>
            : <span>No tienes tokens suficientes</span>
        }
        {
          link !== '' &&
          <div>
            <span>¡Listo!</span>
            <p>Link generado:</p>
            {
              fileType === 'image'
                ? <Link className='underline text-purple-600' href={`/f/${link}`}>{link}</Link>
                : <Link className='underline text-purple-600' href={`/${link}`}>{link}</Link>
            }
          </div>
        }
      </div>
      <section>
        <h2>Files</h2>
        <ul className='flex flex-wrap gap-4'>
          {
            files.length > 0 &&
            files.map(file => {
              const type = file.type.split('/')[0]
              const linkType = type === 'image' ? '/f/' : '/'
              const imageType = type === 'image' ? file.fileURL : '/pdf-icon.png'
              return (
                <li key={file.fileURL} className='flex flex-col gap-4'>
                  <Link href={`${linkType}${file.link}`}>
                    <img className={`${type === 'image' ? ' w-[250px]' : 'w-[120px]'} h-auto object-cover`} src={imageType} alt='image' />
                    <span>{file.name}</span>
                    <span>{file.size}</span>
                    <small>{file.createdAt}</small>
                  </Link>
                  <button onClick={() => { void handleShare(file.link) }}>Share</button>
                </li>
              )
            })
          }
        </ul>
      </section>
    </div>
  )
}
