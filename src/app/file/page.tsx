// Components
import FilesUploaded from '@/components/files-uploaded'

// Services
import { getFilesByUser, getUserDataCookies } from '@/lib/services'

export default async function FilesPage (): Promise<JSX.Element> {
  const { user } = await getUserDataCookies()
  const data = user !== undefined ? await getFilesByUser(user.uid) : []
  return <FilesUploaded files={data} />
}
