// Components
import MainPage from '@/components/main-page'
import SwitchServices from '@/components/switch-services'

// Types
import { type PAYMENT_STATUS } from '@/constants/constants'

// Services
import { getUrls, getUrlsShortenedCookies, getUserDataCookies } from '@/lib/services'

export default async function FilesPage ({ searchParams }: { searchParams: { paymentStatus: typeof PAYMENT_STATUS[number] } }): Promise<JSX.Element> {
  const { user } = await getUserDataCookies()
  const urlsFromCookies = await getUrlsShortenedCookies() as Array<{ url: string, longUrl: string }> ?? []
  const urlsUploaded = user != null ? await getUrls(user?.uid) as Array<{ url: string, longUrl: string }> : []
  const allUrls = urlsUploaded.concat(urlsFromCookies)
  return (
    <MainPage searchParamsValue={searchParams} urlsUploaded={allUrls}>
      <SwitchServices />
    </MainPage>
  )
}
