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
  const { setUser, setTokens } = userStore()

  const handleSignUp = async (): Promise<void> => {
    signInWithPopup(auth, provider)
      .then(async (result) => {
        const userCredentials = result.user
        const userData = {
          name: userCredentials.displayName ?? '',
          email: userCredentials.email ?? '',
          photo: userCredentials.photoURL ?? '',
          uid: userCredentials.uid ?? ''
        }
        setUser(userData)
        // Check if the user is new
        const tokensLength = !isNaN(await setUserDataCookies(userData)) ? await setUserDataCookies(userData) : 0
        setTokens(tokensLength)
      }).catch((error) => {
        return error
      })
  }

  const handleLogOut = async (): Promise<void> => {
    await auth.signOut()
    await deleteUserDataCookies()
    setUser({ name: '', email: '', photo: '', uid: '' })
    setTokens(0)
  }

  return (
    <>
      {
        (user != null && user?.name !== '')
          ? <div className='w-fit flex items-center gap-8 px-4 py-2 rounded-lg'>
              <div className='flex gap-4 items-center'>
                {
                  user.photo !== '' && <img src={user.photo} alt={user.name} className='size-8 rounded-full' referrerPolicy='no-referrer' />
                }
                <span>{user.name}</span>
              </div>
              <button onClick={handleLogOut}><LogOutIcon /></button>
            </div>
          : <div className='w-fit flex items-center gap-8 px-4 py-2 rounded-lg'>
              <button onClick={handleSignUp} className='flex items-center gap-2 bg-bckg text-primary py-2 px-6 rounded-full border-[1px] border-primary'>
                <GoogleIcon /> Iniciar sesión
              </button>
            </div>
      }
    </>
  )
}
