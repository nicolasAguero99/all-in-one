'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'

// Constants
import { SERVICES_DATA } from '@/constants/constants'

// Store
import { userStore } from '@/store/userStore'

export default function SwitchServices ({ userData }: { userData?: { user: any, tokens: number } }): JSX.Element {
  const router = useRouter()
  const pathname = usePathname()
  const [currentService, setCurrentService] = useState<typeof SERVICES_DATA[number]['value'] | ''>('')

  const handleChangeService = (service: typeof SERVICES_DATA[number]['value']): void => {
    router.push(`/${service}`)
    setCurrentService(service)
  }

  const { setUser, setTokens } = userStore()

  // Actualizar el servicio actual cuando cambia la ruta
  useEffect(() => {
    const getCurrentService = pathname.split('/')[1] as typeof SERVICES_DATA[number]['value'] | ''
    const serviceCheck = getCurrentService !== '' ? getCurrentService : SERVICES_DATA[0].value
    setCurrentService(serviceCheck)
  }, [pathname])

  // Inicializar el store con los datos del servidor (solo una vez)
  useEffect(() => {
    if (userData != null) {
      setUser(userData.user ?? { uid: '', name: '', email: '', photo: '' })
      setTokens(userData.tokens ?? 0)
    }
  }, [userData, setUser, setTokens])

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
