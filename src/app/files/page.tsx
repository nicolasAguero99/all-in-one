import FilesUploaded from '@/components/files-uploaded'
import { getFilesByUser, getUserDataCookies } from '@/lib/services'

export default async function FilesPage (): Promise<JSX.Element> {
  const user = await getUserDataCookies()
  const data = await getFilesByUser(user.uid)
  return (
    <div>
      <h1>Files</h1>
      <FilesUploaded files={data} userId={user.uid} />
    </div>
  )
}
