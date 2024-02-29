'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { shallow } from 'zustand/shallow'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { type z } from 'zod'

// Constants
import { API_URL, TOKEN_PRICE } from '@/constants/constants'

// Store
import { userStore } from '@/store/userStore'

// Type
import { inputQuantityTokens } from '@/schema/zod'

export default function PaymentBtn (): JSX.Element {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [priceValue, setPriceValue] = useState(TOKEN_PRICE)

  const { user } = userStore((state) => ({
    user: state.user
  }), shallow)

  const { register, handleSubmit, formState: { errors } } = useForm<z.infer<typeof inputQuantityTokens>>({
    resolver: zodResolver(inputQuantityTokens)
  })

  const handleChangeQuantity = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const quantity = Number(e.target.value)
    const result = (quantity != null && !isNaN(quantity) && quantity > 0) ? quantity * TOKEN_PRICE : TOKEN_PRICE
    setPriceValue(result)
  }

  const handleOpenModal = (): void => { setIsOpen(true) }

  const handleCloseModal = (): void => { setIsOpen(false) }

  const handlePay = async (data: z.infer<typeof inputQuantityTokens>): Promise<void> => {
    if (user.uid === '') return
    const { quantity } = data
    const formData = new FormData()
    formData.append('quantity', quantity)
    console.log('user.uid', user.uid)
    const res = await fetch(`${API_URL}/payment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ userId: user.uid, quantity: Number(quantity) })
    })
    const linkToPay: string = await res.json()
    // use localStorage only in the client side
    if (typeof window !== 'undefined') {
      localStorage.setItem('quantity', quantity)
    }
    router.push(linkToPay)
  }

  return (
    <>
      <button className='bg-amber-400' onClick={handleOpenModal}>Pagar</button>
      {
        isOpen && (
          <>
          <div className="w-screen h-screen fixed top-0 left-0 bg-black/30"></div>
          <div className="w-3/5 h-[250px] fixed top-0 left-0 right-0 bottom-0 m-auto px-4 py-4 rounded-lg shadow-lg bg-white">
            <button onClick={handleCloseModal} className='absolute top-2 right-4'>x</button>
            <form onSubmit={handleSubmit(handlePay)}>
              <input className='border-2 border-black/20' type="number" {...register('quantity')} onChange={(e) => { handleChangeQuantity(e) }} />
              {errors.quantity?.message != null && <span className='text-red-600'>{String(errors.quantity?.message)}</span>}
              <span className='text-gray-500'>{Number(priceValue).toLocaleString('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 })}</span>
              <button className='bg-blue-600 text-white' type='submit'>Pagar</button>
            </form>
          </div>
          </>
        )
      }
    </>
  )
}
