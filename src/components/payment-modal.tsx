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
      <div className="w-3/5 h-[250px] flex flex-col justify-center fixed top-0 left-0 right-0 bottom-0 m-auto px-4 py-4 rounded-lg shadow-lg shadow-[#ffffff]/5 bg-bckg z-50">
        {
          isApproved === 'success'
            ? <div className='flex flex-col gap-4 text-center'>
                <h4 className='text-2xl text-center'>¡Pago realizado!</h4>
                {
                  quantity != null
                    ? <p className='text-white/60'>Se han acreditado <b>{quantity}</b> tokens</p>
                    : <p className='text-white/60'>Se han acreditado tus tokens</p>
                }
              </div>
            : <div className='flex flex-col gap-4 text-center'>
                <h4 className='text-2xl text-center'>¡Pago rechazado!</h4>
                <p className='text-white/60'>No se ha podido realizar el pago</p>
              </div>
        }
        <button onClick={handleAccept} className="w-1/2 bg-primary text-bckg font-medium py-2 px-4 mx-auto rounded-lg mt-6">Aceptar</button>
      </div>
    </>
  )
}
<div className='flex flex-col gap-4 items-center'>
  <span className='text-3xl font-semibold'>Iniciar sesión</span>
  <p className='text-white/60'>Para realizar esta operación debes iniciar sesión y obtener tokens</p>
</div>
