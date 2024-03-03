import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ToastContainer } from 'react-toastify'

// Styles
import './globals.css'
import 'react-toastify/dist/ReactToastify.css'

// Components
import Nav from '@/components/nav'
import SwitchServices from '@/components/switch-services'
import PaymentBtn from '@/components/payment-btn'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Create Next App',
  description: 'Generated by create next app'
}

export default function RootLayout ({
  children
}: Readonly<{
  children: React.ReactNode
}>): JSX.Element {
  return (
    <html lang='es'>
      <body className={`${inter.className} bg-gray-800 text-white`}>
        <Nav />
        <h1 className='text-6xl font-semibold text-center'>All in one</h1>
        <SwitchServices />
        <PaymentBtn />
        {children}
        <ToastContainer />
      </body>
    </html>
  )
}
