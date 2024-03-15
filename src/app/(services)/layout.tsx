// Styles
import 'react-toastify/dist/ReactToastify.css'

// Components
import SwitchServices from '@/components/switch-services'

export default function RootLayout ({
  children
}: Readonly<{
  children: React.ReactNode
}>): JSX.Element {
  return (
    <>
      <SwitchServices />
      {children}
    </>
  )
}
