// Components
import MainPage from '@/components/main-page'

// Constants
import { type PAYMENT_STATUS } from '@/constants/constants'

// Services
import { getUrls, getUserDataCookies } from '@/lib/services'

export default async function App ({ searchParams }: { searchParams: { paymentStatus: typeof PAYMENT_STATUS[number] } }): Promise<JSX.Element> {
  const { user } = await getUserDataCookies()
  const urlsUploaded = user != null ? await getUrls(user?.uid) as Array<{ url: string, longUrl: string }> : []
  return <MainPage searchParamsValue={searchParams} urlsUploaded={urlsUploaded} />
}
