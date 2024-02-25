import { useRouter } from 'next/navigation'
import { shallow } from 'zustand/shallow'

// Constants
import { API_URL } from '@/constants/constants'

// Store
import { userStore } from '@/store/userStore'

export default function DeleteFile ({ pathId, fileName }: { pathId: string, fileName: string }): JSX.Element {
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
      body: JSON.stringify({ userId: user.uid, fileName })
    })
    router.refresh()
  }

  return (
    <button onClick={handleDelete} className="text-red-600">Delete</button>
  )
}
