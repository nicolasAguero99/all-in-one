// Components
import FilesUploaded from '@/components/files-uploaded'
// Services
import { getFilesByUser, getTokensByUser, getUserDataCookies } from '@/lib/services'

export default async function FilesPage (): Promise<JSX.Element> {
  const user = await getUserDataCookies()
  const data = user !== undefined ? await getFilesByUser(user.uid) : []
  const tokensLength = user !== undefined ? await getTokensByUser(user.uid) : 0
  return (
    <div>
      <h1>Files</h1>
      <FilesUploaded files={data} tokensLength={Number(tokensLength)} />
    </div>
  )
}
