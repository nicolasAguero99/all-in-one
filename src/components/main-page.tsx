'use client'

// Constants
import { type PAYMENT_STATUS } from '@/constants/constants'

// Components
import PaymentModal from '@/components/payment-modal'
import UrlForm from './form-url'

// Illustration
import RobotIllustration from './illustrations/robot-illustration'

export default function MainPage ({ searchParamsValue = null, urlsUploaded, children }: { searchParamsValue: { paymentStatus: typeof PAYMENT_STATUS[number] } | null, urlsUploaded: Array<{ url: string, longUrl: string }> | [], children?: JSX.Element }): JSX.Element {
  const paymentStatus = searchParamsValue != null ? searchParamsValue.paymentStatus : null

  return (
    <>
      <main className='flex flex-col justify-center gap-2 px-6'>
        <div className='m-auto'>
          <RobotIllustration />
        </div>
        <h1 className='text-xl font-semibold text-center'>¿Qué vamos a hacer hoy?</h1>
        {children}
        <PaymentModal paymentStatus={paymentStatus} />
        <UrlForm urlsUploaded={urlsUploaded} />
      </main>
    </>
  )
}
