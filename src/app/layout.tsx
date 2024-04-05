import type { Metadata } from 'next'
import { ToastContainer } from 'react-toastify'

// Styles
import './globals.css'
import 'react-toastify/dist/ReactToastify.css'

// Components
import Nav from '@/components/nav'

export const metadata: Metadata = {
  title: 'All in one - Url File QR',
  description: 'Acorta tus URLs, sube tus archivos a la nube y genera tu QR, todo en un solo lugar.'
}

export default function RootLayout ({
  children
}: Readonly<{
  children: React.ReactNode
}>): JSX.Element {
  return (
    <html lang='es'>
      <body className='bg-bckg text-primary p-6 bg-[url(/illustrations/bckg-illustration.svg)] bg-cover bg-center bg-fixed h-screen'>
        <Nav />
        {children}
        <ToastContainer />
      </body>
    </html>
  )
}
