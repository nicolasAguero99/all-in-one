// Components
import SignUpOutButton from '@/components/sign-up-out-button'

export default function Nav (): JSX.Element {
  return (
    <nav className='flex justify-between items-center'>
      <span>All in one</span>
      <SignUpOutButton />
    </nav>
  )
}
