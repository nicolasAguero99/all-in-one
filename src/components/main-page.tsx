'use client'

import { useEffect } from 'react'

// Constants
import { type PAYMENT_STATUS } from '@/constants/constants'

// Components
import UrlForm from '@/components/form-url'
import PaymentBtn from '@/components/payment-btn'
import PaymentModal from '@/components/payment-modal'
import SignUpOutButton from '@/components/sign-up-out-button'

// Services
import FilesUploaded from '@/components/files-uploaded'
import FormFiles from '@/components/form-files'

// Store
import { userStore } from '@/store/userStore'

// Types
import { type FileData, type UserData } from '@/types/types'

export default function MainPage ({ searchParamsValue, userData, files = [], tokensLength }: { searchParamsValue: { paymentStatus: typeof PAYMENT_STATUS[number] }, userData: UserData, files: FileData[], tokensLength: number }): JSX.Element {
  const { paymentStatus } = searchParamsValue

  const { setUser, setTokens } = userStore()

  useEffect(() => {
    if (userData == null) return
    setUser(userData)
  }, [userData])

  useEffect(() => {
    if (tokensLength == null) return
    setTokens(tokensLength)
  }, [tokensLength])

  return (
    <div className='px-6'>
      <h1>App en proceso</h1>
      <PaymentModal paymentStatus={paymentStatus} />
      <SignUpOutButton />
      <section>
        <h2>Acortador url</h2>
        <UrlForm />
      </section>
      <div>
        <div className='flex gap-4'>
          <span>Tienes {tokensLength} tokens</span>
          <PaymentBtn />
        </div>
        <FormFiles />
      </div>
      <FilesUploaded files={files} />
    </div>
  )
}
