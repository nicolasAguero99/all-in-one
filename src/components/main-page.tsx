'use client'

import { useEffect } from 'react'
import { getAuth, signInWithPopup, GoogleAuthProvider } from 'firebase/auth'
import { shallow } from 'zustand/shallow'

// Constants
import { type PAYMENT_STATUS } from '@/constants/constants'

// Components
import UrlForm from '@/components/url-form'
import PaymentBtn from '@/components/payment-btn'
import PaymentModal from '@/components/payment-modal'

// Lib
import { app } from '@/lib/firebase'

// Services
import { deleteUserDataCookies, setUserDataCookies } from '@/lib/services'
import FilesUploaded from '@/components/files-uploaded'
import FormFiles from '@/components/form-files'

// Store
import { userStore } from '@/store/userStore'

// Types
import { type FileData, type UserData } from '@/types/types'

export default function MainPage ({ searchParamsValue, userData, files = [], tokensLength }: { searchParamsValue: { paymentStatus: typeof PAYMENT_STATUS[number] }, userData: UserData, files: FileData[], tokensLength: number }): JSX.Element {
  const { paymentStatus } = searchParamsValue

  // User Store
  const { user } = userStore((state) => ({
    user: state.user
  }), shallow)
  const { setUser, setTokens } = userStore()

  const auth = getAuth(app)
  const provider = new GoogleAuthProvider()

  useEffect(() => {
    if (userData == null) return
    setUser(userData)
  }, [userData])

  useEffect(() => {
    if (tokensLength == null) return
    setTokens(tokensLength)
  }, [tokensLength])

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
          <span>Tienes {tokensLength} tokens</span>
          <PaymentBtn userId={user.uid} />
        </div>
        <FormFiles />
      </div>
      <FilesUploaded files={files} />
    </div>
  )
}
