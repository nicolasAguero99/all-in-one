import Link from 'next/link'

// Components
import SignUpOutButton from '@/components/sign-up-out-button'

export default function Nav (): JSX.Element {
  return (
    <nav className='flex justify-between items-center'>
      <Link href='/' className='uppercase max-[599px]:hidden'>All in one</Link>
      <Link href='/' className='uppercase min-[600px]:hidden'>Aio</Link>
      <SignUpOutButton />
    </nav>
  )
}
