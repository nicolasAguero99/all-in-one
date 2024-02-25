import { useRouter } from 'next/navigation'
import { shallow } from 'zustand/shallow'

// Constants
import { API_URL } from '@/constants/constants'

// Store
import { userStore } from '@/store/userStore'

export default function PaymentBtn ({ userId }: { userId: string }): JSX.Element {
  const router = useRouter()

  const { user } = userStore((state) => ({
    user: state.user
  }), shallow)

  const handlePay = async (): Promise<void> => {
    if (userId === '') return
    const res = await fetch(`${API_URL}/payment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ userId: user.uid })
    })
    const data: string = await res.json()
    console.log('data', data)
    router.push(data)
  }

  return (
    <button className='bg-amber-400' onClick={handlePay}>Pagar</button>
  )
}
