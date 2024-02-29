// Components
import UrlForm from '@/components/form-url'

// Services
import { getUrls, getUserDataCookies } from '@/lib/services'

export default async function FilesPage (): Promise<JSX.Element> {
  const user = await getUserDataCookies()
  const urlsUploaded = user != null ? await getUrls(user?.uid) as string[] : []
  return <UrlForm urlsUploaded={urlsUploaded} />
}
