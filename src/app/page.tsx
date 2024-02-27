// Components
import MainPage from '@/components/main-page'

// Constants
import { type PAYMENT_STATUS } from '@/constants/constants'
import { getFilesByUser, getTokensByUser, getUserDataCookies } from '@/lib/services'

export default async function App ({ searchParams }: { searchParams: { paymentStatus: typeof PAYMENT_STATUS[number] } }): Promise<JSX.Element> {
  const user = await getUserDataCookies()
  const data = user !== undefined ? await getFilesByUser(user.uid) : []
  const tokensLength = user !== undefined ? await getTokensByUser(user.uid) : 0

  return <MainPage searchParamsValue={searchParams} userData={user} files={data} tokensLength={Number(tokensLength)} />
}
