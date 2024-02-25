'use client'

import { useEffect, useState } from 'react'
import { getAuth, signInWithPopup, GoogleAuthProvider } from 'firebase/auth'
import { shallow } from 'zustand/shallow'

// Constants
import { API_URL, type PAYMENT_STATUS } from '@/constants/constants'

// Types
import { type FileData } from '@/types/types'

// Components
import UrlForm from '@/components/url-form'
import PaymentBtn from '@/components/payment-btn'
import PaymentModal from '@/components/payment-modal'

// Lib
import { app } from '@/lib/firebase'

// Services
import { deleteUserDataCookies, getFilesByUser, getUserDataCookies, setUserDataCookies } from '@/lib/services'
import FilesUploaded from '@/components/files-uploaded'
import FormFiles from '@/components/form-files'

// Store
import { userStore } from '@/store/userStore'
import { errorStore } from '@/store/errorStore'

export default function App ({ searchParams }: { searchParams: { paymentStatus: typeof PAYMENT_STATUS[number] } }): JSX.Element {
  const { paymentStatus } = searchParams
  console.log('searchParams', searchParams)

  const [files, setFiles] = useState<FileData[]>([])

  // User Store
  const { user, tokens } = userStore((state) => ({
    user: state.user,
    tokens: state.tokens
  }), shallow)
  const { setUser, setTokens } = userStore()

  // Errors Store
  const { error } = errorStore((state) => ({
    error: state.error
  }), shallow)
  const { setError } = errorStore()

  const auth = getAuth(app)
  const provider = new GoogleAuthProvider()

  useEffect(() => {
    const getFiles = async (): Promise<void> => {
      if (user.uid === '') return
      const data = await getFilesByUser(user.uid)
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
      if (Number(tokens) <= 0) {
        setError('No tienes tokens suficientes')
      }
    }
    void getTokens()
  }, [user.uid])

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
      <h1>App en proceso</h1>
    <PaymentModal paymentStatus={paymentStatus} />
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
        <FormFiles />
      </div>
      <FilesUploaded files={files} />
    </div>
  )
}
