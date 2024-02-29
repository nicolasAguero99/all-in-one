'use client'

// Constants
import { type PAYMENT_STATUS } from '@/constants/constants'

// Components
import PaymentBtn from '@/components/payment-btn'
import PaymentModal from '@/components/payment-modal'

export default function MainPage ({ searchParamsValue }: { searchParamsValue: { paymentStatus: typeof PAYMENT_STATUS[number] } }): JSX.Element {
  const { paymentStatus } = searchParamsValue

  return (
    <main className='flex flex-col justify-center px-6'>
      <PaymentModal paymentStatus={paymentStatus} />
      <div className='flex gap-4'>
        {/* <span>Tienes {tokensLength} tokens</span> */}
        <PaymentBtn />
      </div>
    </main>
  )
}
