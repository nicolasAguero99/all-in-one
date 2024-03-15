// Components
import QrForm from '@/components/qr-form'

// Services
import { getQrs, getUserDataCookies } from '@/lib/services'

export default async function QrPage (): Promise<JSX.Element> {
  const { user } = await getUserDataCookies()
  const qrsUrl = user != null ? await getQrs(user?.uid) as Array<{ qr: string, url: string }> : []
  return <QrForm qrsUrl={qrsUrl} />
}
