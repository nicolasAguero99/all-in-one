import Link from 'next/link'

export default function NotFound (): JSX.Element {
  return (
    <main>
      <h1>Not Found</h1>
      <p>Return to the <Link href='/' replace={true} className='underline text-blue-500'>home</Link></p>
    </main>
  )
}
