import Link from 'next/link'

export default function NotFound (): JSX.Element {
  return (
    <main>
      <h1>Not Found</h1>
      <p>Return to the <Link href='/' className='underline text-purple-500'>home</Link></p>
    </main>
  )
}
