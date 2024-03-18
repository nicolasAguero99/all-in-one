import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ToastContainer } from 'react-toastify'

// Styles
import './globals.css'
import 'react-toastify/dist/ReactToastify.css'

// Components
import Nav from '@/components/nav'

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
      <body className={`${inter.className} bg-bckg text-primary p-6 bg-[url(/illustrations/bckg-illustration.svg)] bg-cover bg-center bg-no-repeat h-screen`}>
        <Nav />
        {children}
        <ToastContainer />
      </body>
    </html>
  )
}
