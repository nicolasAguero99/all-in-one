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
      <div className='w-fit flex max-[600px]:flex-col max-[600px]:w-full items-center gap-4'>
        {
          SERVICES_DATA.map((service) => (
            <button className={`${service.value === currentService ? 'bg-primary text-bckg' : 'bg-bckg text-primary'} max-[600px]:w-full py-1 px-8 rounded-full border-[1px] border-primary z-20`} key={service.value} onClick={() => { handleChangeService(service.value) }}>
              {service.name}
            </button>
          ))
        }
      </div>
    </div>
  )
}
