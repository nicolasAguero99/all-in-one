'use client'

import { getAuth, signInWithPopup, GoogleAuthProvider } from 'firebase/auth'
import { shallow } from 'zustand/shallow'

// Lib
import { app } from '@/lib/firebase'

// Icons
import LogOutIcon from './icons/log-out-icon'
import GoogleIcon from './icons/google-icon'

// Store
import { userStore } from '@/store/userStore'

// Services
import { setUserDataCookies, deleteUserDataCookies } from '@/lib/services'

export default function SignUpOutButton (): JSX.Element {
  const auth = getAuth(app)
  const provider = new GoogleAuthProvider()
  const { user } = userStore((state) => ({
    user: state.user
  }), shallow)
  const { setUser } = userStore()

  const handleSignUp = async (): Promise<void> => {
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
    <>
      {
        (user != null && user?.name !== '')
          ? <div className='w-fit flex items-center gap-8 px-4 py-2 rounded-lg'>
              <div className='flex gap-4 items-center'>
                {
                  user.photo !== '' && <img src={user.photo} alt={user.name} className='size-8 rounded-full' />
                }
                <span>{user.name}</span>
              </div>
              <button onClick={handleLogOut}><LogOutIcon /></button>
            </div>
          : <div className='w-fit flex items-center gap-8 px-4 py-2 rounded-lg'>
              <button onClick={handleSignUp} className='flex items-center gap-2 bg-blue-600 text-white p-2 rounded-lg'>
                Iniciar sesión <GoogleIcon />
              </button>
            </div>
      }
    </>
  )
}
