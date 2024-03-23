'use client'

import { shallow } from 'zustand/shallow'
import '@/app/globals.css'

// Constants
import { type PAYMENT_STATUS } from '@/constants/constants'

// Components
import PaymentModal from '@/components/payment-modal'
import UrlForm from './form-url'

// Illustration
import RobotIllustration from './illustrations/robot-illustration'

// Store
import { errorStore } from '@/store/errorStore'
import { useEffect } from 'react'

export default function MainPage ({ searchParamsValue = null, urlsUploaded, children }: { searchParamsValue: { paymentStatus: typeof PAYMENT_STATUS[number] } | null, urlsUploaded: Array<{ url: string, longUrl: string }> | [], children?: JSX.Element }): JSX.Element {
  const paymentStatus = searchParamsValue != null ? searchParamsValue.paymentStatus : null
  const { error } = errorStore((state) => ({
    error: state.error
  }), shallow)

  useEffect(() => {
    console.log('error', error)
  }, [error])

  return (
    <>
      <main className='flex flex-col justify-center gap-2 px-6'>
        <div className='m-auto relative'>
          <RobotIllustration error={error !== ''} />
          {error !== '' && <span className='absolute top-0 bottom-0 my-auto -right-[320px] w-[300px] size-fit bg-primary text-bckg font-medium px-4 py-2 rounded-full shadow-lg before:absolute before:top-0 before:bottom-0 before:m-auto before:-left-[10px] before:size-4 before:bg-primary custom-clip-path-msg'>{error}</span>}
        </div>
        <h1 className='text-xl font-semibold text-center'>¿Qué vamos a hacer hoy?</h1>
        {children}
        <PaymentModal paymentStatus={paymentStatus} />
        <UrlForm urlsUploaded={urlsUploaded} />
      </main>
    </>
  )
}
