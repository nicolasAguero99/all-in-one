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

  const { user, tokens } = userStore((state) => ({
    user: state.user,
    tokens: state.tokens
  }), shallow)

  const { register, handleSubmit, formState: { errors } } = useForm<z.infer<typeof inputQuantityTokens>>({
    resolver: zodResolver(inputQuantityTokens)
  })

  const handleChangeQuantity = (e: React.ChangeEvent<HTMLInputElement>): void => {
    if (e.target.value === '') return
    Number(e.target.value) < 1 && (e.target.value = '1')
    Number(e.target.value) > 50 && (e.target.value = '50')
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
    const res = await fetch(`${API_URL}/payment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ userId: user.uid, quantity: Number(quantity) })
    })
    const linkToPay: string = await res.json()
    if (typeof window !== 'undefined') {
      localStorage.setItem('quantity', quantity)
    }
    router.push(linkToPay)
  }

  return (
    <>
      {
        user.uid !== '' &&
          <div className='flex justify-center items-center gap-4 my-6'>
            {
              tokens > 0
                ? <span className='text-primary'>Tienes <b className='font-semibold'>{tokens}</b> tokens</span>
                : <span className='text-primary'>No tienes tokens</span>
            }
            <button className='bg-primary p-2 rounded-full' onClick={handleOpenModal}>
              <img className='size-4' src="icons/plus-icon.svg" alt="comprar más" />
            </button>
            {
              isOpen && (
                <>
                <div onClick={handleCloseModal} className="w-screen h-screen fixed top-0 left-0 bg-black/30 cursor-pointer"></div>
                <div className="w-3/5 h-[250px] flex flex-col justify-center fixed top-0 left-0 right-0 bottom-0 m-auto px-4 py-4 rounded-lg shadow-lg shadow-[#ffffff]/5 bg-bckg z-50">
                  <button onClick={handleCloseModal} className='absolute top-4 right-4'>
                    <img className='size-6' src="icons/cross-icon.svg" alt="cerrar modal" />
                  </button>
                  <form onSubmit={handleSubmit(handlePay)} className='flex flex-col justify-center items-center gap-8'>
                    <div className='flex items-center gap-4'>
                      <input className='text-xl text-black rounded-lg px-4 py-1' type="number" placeholder='Tokens' defaultValue='1' min='1' max='50' {...register('quantity')} onChange={(e) => { handleChangeQuantity(e) }} />
                      {errors.quantity?.message != null && <span className='text-red-600'>{String(errors.quantity?.message)}</span>}
                      <span className='text-xl text-primary'>= {Number(priceValue).toLocaleString('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 })}</span>
                    </div>
                    <button className='flex-1 w-1/2 bg-primary text-bckg py-2 px-4 rounded-lg' type='submit'>Pagar</button>
                  </form>
                </div>
                </>
              )
            }
          </div>
      }
    </>
  )
}
