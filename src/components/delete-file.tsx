'use client'

import { useRouter } from 'next/navigation'
import { shallow } from 'zustand/shallow'

// Constants
import { API_URL } from '@/constants/constants'

// Store
import { userStore } from '@/store/userStore'

// Icons
import DeleteIcon from './icons/delete-icon'

export default function DeleteFile ({ pathId, fileName, type }: { pathId: string, fileName: string, type: string }): JSX.Element {
  const router = useRouter()
  const { user } = userStore((state) => ({
    user: state.user
  }), shallow)

  const handleDelete = async (): Promise<void> => {
    console.log('delete file')
    await fetch(`${API_URL}/paths/${pathId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ userId: user.uid, fileName, type })
    })
    router.refresh()
  }

  return (
    <button onClick={handleDelete} className="absolute top-4 right-4 [&>svg]:size-7 p-0.5 rounded-lg shadow-md bg-white z-30"><DeleteIcon /></button>
  )
}
