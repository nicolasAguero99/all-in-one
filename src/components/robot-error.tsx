'use client'

import { shallow } from 'zustand/shallow'

// Illustrations
import RobotIllustration from './illustrations/robot-illustration'

// Store
import { errorStore } from '@/store/errorStore'

export default function RobotError (): JSX.Element {
  const { error } = errorStore((state) => ({
    error: state.error
  }), shallow)
  return (
    <div className='m-auto relative max-[820px]:my-10'>
      <RobotIllustration error={error !== ''} />
      {error !== '' && <span className='absolute top-0 bottom-0 my-auto -right-[320px] max-[820px]:-bottom-[160px] max-[820px]:-right-[80px] w-[300px] size-fit bg-primary text-bckg font-medium px-4 py-2 rounded-full shadow-lg before:absolute before:top-0 min-[820px]:before:bottom-0 max-[820px]:before:-top-4 max-[820px]:before:left-0 max-[820px]:before:right-0 max-[820px]:before:rotate-90 max-[820px]:text-sm max-[820px]:text-center before:m-auto before:-left-[10px] before:size-4 before:bg-primary custom-clip-path-msg'>{error}</span>}
    </div>
  )
}
