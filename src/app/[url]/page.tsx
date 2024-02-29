import DynamicUrlPage from '@/components/dynamic-url-page'

export default function UrlPage ({ params }: { params: { url: string } }): JSX.Element | undefined {
  return <DynamicUrlPage paramsValue={params} />
}
