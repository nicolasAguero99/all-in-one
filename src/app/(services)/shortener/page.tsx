// Components
import MainPage from '@/components/main-page'
import PaymentBtn from '@/components/payment-btn'
import SwitchServices from '@/components/switch-services'

// Types
import { type PAYMENT_STATUS } from '@/constants/constants'

// Services
import { getUrls, getUrlsShortenedCookies, getUserDataCookies } from '@/lib/services'

export default async function FilesPage ({ searchParams }: { searchParams: { paymentStatus: typeof PAYMENT_STATUS[number] } }): Promise<JSX.Element> {
  const { user } = await getUserDataCookies()
  const urlsFromCookies = await getUrlsShortenedCookies() as Array<{ url: string, longUrl: string }> ?? []
  const urlsUploaded = user != null ? await getUrls(user?.uid) : { error: 'No user found', status: 404 }

  // @ts-expect-error - urlsUploaded is an array of objects or an object with an error property
  const allUrls = urlsUploaded?.error == null ? (urlsUploaded as Array<{ url: string, longUrl: string }>).concat(urlsFromCookies) : urlsFromCookies
  return (
    <MainPage searchParamsValue={searchParams} urlsUploaded={allUrls}>
      <PaymentBtn />
      <SwitchServices />
    </MainPage>
  )
}
