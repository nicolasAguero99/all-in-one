// Components
import MainPage from '@/components/main-page'

// Services
import { getUrls, getUserDataCookies } from '@/lib/services'

export default async function FilesPage (): Promise<JSX.Element> {
  const user = await getUserDataCookies()
  const urlsUploaded = user != null ? await getUrls(user?.uid) as Array<{ url: string, longUrl: string }> : []
  return <MainPage searchParamsValue={null} urlsUploaded={urlsUploaded} />
}
