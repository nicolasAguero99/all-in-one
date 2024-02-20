import { useRouter } from 'next/navigation'

// Constants
import { API_URL } from '@/constants/constants'

export default function PaymentBtn (): JSX.Element {
  const router = useRouter()

  const handlePay = async (): Promise<void> => {
    const res = await fetch(`${API_URL}/payment`, {
      method: 'POST'
    })
    const data: string = await res.json()
    console.log('data', data)
    router.push(data)
  }

  return (
    <button className='bg-amber-400' onClick={handlePay}>Pagar</button>
  )
}
