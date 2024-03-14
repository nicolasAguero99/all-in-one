// Components
import DynamicFilePage from '@/components/dynamic-file-page'

export default function PathPage ({ params }: { params: { path: string } }): JSX.Element {
  return <DynamicFilePage paramsValue={params} />
}
