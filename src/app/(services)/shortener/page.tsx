// Components
import MainPage from '@/components/main-page'

// Services
import { getUrls, getUrlsShortenedCookies, getUserDataCookies } from '@/lib/services'

export default async function FilesPage (): Promise<JSX.Element> {
  const { user } = await getUserDataCookies()
  const urlsFromCookies = await getUrlsShortenedCookies() as Array<{ url: string, longUrl: string }> ?? []
  const urlsUploaded = user != null ? await getUrls(user?.uid) as Array<{ url: string, longUrl: string }> : []
  const allUrls = urlsUploaded.concat(urlsFromCookies)
  return <MainPage searchParamsValue={null} urlsUploaded={allUrls} />
}
