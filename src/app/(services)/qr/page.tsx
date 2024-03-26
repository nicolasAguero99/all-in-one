// Components
import PaymentBtn from '@/components/payment-btn'
import QrForm from '@/components/qr-form'
import SwitchServices from '@/components/switch-services'

// Services
import { getQrs, getUserDataCookies } from '@/lib/services'

export default async function QrPage (): Promise<JSX.Element> {
  const { user } = await getUserDataCookies()
  const qrsUrl = user != null ? await getQrs(user?.uid) as Array<{ qr: string, url: string }> : []
  return (
    <QrForm qrsUrl={qrsUrl}>
      <PaymentBtn />
      <SwitchServices />
    </QrForm>
  )
}
