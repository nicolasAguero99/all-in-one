'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

// Constants
import { SERVICES_DATA } from '@/constants/constants'

// Store
import { userStore } from '@/store/userStore'

// Services
import { getTokensByUser, getUserDataCookies } from '@/lib/services'

export default function SwitchServices (): JSX.Element {
  const router = useRouter()

  const handleChangeService = (service: typeof SERVICES_DATA[number]['value']): void => {
    router.push(`/${service}`)
  }

  const { setUser, setTokens } = userStore()

  useEffect(() => {
    const init = async (): Promise<void> => {
      const user = await getUserDataCookies()
      if (user == null) return
      const tokensLength = user != null ? await getTokensByUser(user.uid) : 0
      setUser(user)
      setTokens(Number(tokensLength))
    }
    void init()
  }, [])

  return (
    <div className='my-4 flex justify-center'>
      <div className='w-48 flex justify-center items-center bg-slate-500 px-4 py-2 rounded-full'>
        {
          SERVICES_DATA.map((service) => (
            <button className='px-6' key={service.value} onClick={() => { handleChangeService(service.value) }}>
              {service.name}
            </button>
          ))
        }
      </div>
    </div>
  )
}
