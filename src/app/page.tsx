// Components
import MainPage from '@/components/main-page'

// Constants
import { type PAYMENT_STATUS } from '@/constants/constants'

export default async function App ({ searchParams }: { searchParams: { paymentStatus: typeof PAYMENT_STATUS[number] } }): Promise<JSX.Element> {
  return <MainPage searchParamsValue={searchParams} />
}
