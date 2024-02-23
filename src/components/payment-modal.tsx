'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function PaymentModal (): JSX.Element | null {
  const router = useRouter()
  const search = useSearchParams()
  const [isApproved, setIsApproved] = useState<string | null>(null)

  useEffect(() => {
    const checkApproved = search.get('success') !== null ? 'success' : search.get('failure') !== null ? 'failure' : null
    setIsApproved(checkApproved)
  }, [search])

  if (isApproved === null) {
    return null
  }

  const handleAccept = (): void => {
    router.replace('/')
  }

  return (
    <>
      <div className="w-screen h-screen fixed top-0 left-0 bg-black/30"></div>
      <div className="w-3/5 h-[250px] fixed top-0 left-0 right-0 bottom-0 m-auto px-4 py-4 rounded-lg shadow-lg bg-white">
        {
          isApproved === 'success'
            ? <>
                <h4>¡Pago realizado!</h4>
                <p>Se han acreditado tus tokens</p>
              </>
            : <>
                <h4 className='text-red-600'>¡Pago rechazado!</h4>
                <p>No se ha podido realizar el pago</p>
              </>
        }
        <button onClick={handleAccept} className="bg-slate-500 text-white px-4 py-2 rounded-lg">Aceptar</button>
      </div>
    </>
  )
}