// Components
import FilesUploaded from '@/components/files-uploaded'
import PaymentBtn from '@/components/payment-btn'
import SwitchServices from '@/components/switch-services'

// Services
import { getFilesByUser, getUserDataCookies } from '@/lib/services'

export default async function FilesPage (): Promise<JSX.Element> {
  const { user, tokens } = await getUserDataCookies()
  // Solo hacer la llamada si hay usuario
  const data = user !== undefined ? await getFilesByUser(user.uid) : []
  return (
    <FilesUploaded files={data}>
      <PaymentBtn />
      <SwitchServices userData={{ user, tokens }} />
    </FilesUploaded>
  )
}
