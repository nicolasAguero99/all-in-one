'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

// Constants
import { SERVICES_DATA } from '@/constants/constants'

// Store
import { userStore } from '@/store/userStore'

// Services
import { getTokensByUser, getUserDataCookies } from '@/lib/services'

export default function SwitchServices (): JSX.Element {
  const router = useRouter()
  const [currentService, setCurrentService] = useState<typeof SERVICES_DATA[number]['value'] | ''>('')

  const handleChangeService = (service: typeof SERVICES_DATA[number]['value']): void => {
    router.push(`/${service}`)
    setCurrentService(service)
  }

  const { setUser, setTokens } = userStore()

  useEffect(() => {
    const getCurrentService = window.location.pathname.split('/')[1] as typeof SERVICES_DATA[number]['value'] | ''
    setCurrentService(getCurrentService)
  }, [])

  useEffect(() => {
    const getCurrentService = typeof window !== 'undefined' ? window.location.pathname.split('/')[1] as typeof SERVICES_DATA[number]['value'] : ''
    const serviceCheck = getCurrentService !== '' ? getCurrentService : SERVICES_DATA[0].value
    setCurrentService(serviceCheck)

    const init = async (): Promise<void> => {
      const { user } = await getUserDataCookies()
      if (user == null) return
      const tokensLength = user != null ? await getTokensByUser(user.uid) : 0
      setUser(user)
      setTokens(Number(tokensLength))
    }
    void init()
  }, [])

  return (
    <div className='my-6 flex justify-center'>
      <div className='relative w-48 flex justify-center items-center bg-slate-500 px-1 py-1 rounded-full overflow-hidden'>
        <div className={`bg-red-700 rounded-full absolute top-0 ${currentService === SERVICES_DATA[0].value ? 'left-0' : currentService === SERVICES_DATA[1].value ? 'left-[68px]' : 'left-[140px]'} w-[55px] h-full transition-all duration-500 ease-out`}></div>
        {
          SERVICES_DATA.map((service) => (
            <button className='px-6 z-20' key={service.value} onClick={() => { handleChangeService(service.value) }}>
              {service.name}
            </button>
          ))
        }
      </div>
    </div>
  )
}
