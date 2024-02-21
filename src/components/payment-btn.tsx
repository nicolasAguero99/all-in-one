import { useRouter } from 'next/navigation'

// Constants
import { API_URL } from '@/constants/constants'

export default function PaymentBtn ({ userId }: { userId: string }): JSX.Element {
  const router = useRouter()

  const handlePay = async (): Promise<void> => {
    if (userId === '') return
    const res = await fetch(`${API_URL}/payment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ userId })
    })
    const data: string = await res.json()
    console.log('data', data)
    router.push(data)
  }

  return (
    <button className='bg-amber-400' onClick={handlePay}>Pagar</button>
  )
}
