'use client'

// Constants
import { type PAYMENT_STATUS } from '@/constants/constants'

// Components
import PaymentModal from '@/components/payment-modal'
import UrlForm from './form-url'

export default function MainPage ({ searchParamsValue = null, urlsUploaded }: { searchParamsValue: { paymentStatus: typeof PAYMENT_STATUS[number] } | null, urlsUploaded: Array<{ url: string, longUrl: string }> | [] }): JSX.Element {
  const paymentStatus = searchParamsValue != null ? searchParamsValue.paymentStatus : null

  return (
    <main className='flex flex-col justify-center gap-2 px-6'>
      <h1 className='text-6xl font-semibold text-center'>Acortador de url</h1>
      <PaymentModal paymentStatus={paymentStatus} />
      <UrlForm urlsUploaded={urlsUploaded} />
    </main>
  )
}
