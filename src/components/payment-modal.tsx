import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

// Constants
import { PAYMENT_STATUS } from '@/constants/constants'

export default function PaymentModal ({ paymentStatus }: { paymentStatus: typeof PAYMENT_STATUS[number] | null }): JSX.Element | null {
  const router = useRouter()
  const search = useSearchParams()
  const [isApproved, setIsApproved] = useState<string | null>(null)
  const quantity = typeof window !== 'undefined' ? (localStorage.getItem('quantity') != null ? localStorage.getItem('quantity') : null) : null
  useEffect(() => {
    const checkApproved = paymentStatus === PAYMENT_STATUS[0] ? PAYMENT_STATUS[0] : paymentStatus === PAYMENT_STATUS[1] ? PAYMENT_STATUS[1] : null
    console.log('checkApproved', checkApproved)

    setIsApproved(checkApproved)
  }, [search])

  if (isApproved === null) {
    return null
  }

  const handleAccept = (): void => {
    localStorage.removeItem('quantity')
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
                {
                  quantity != null
                    ? <p>Se han acreditado <b>{quantity}</b> tokens</p>
                    : <p>Se han acreditado tus tokens</p>
                }
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
