'use client'

import { shallow } from 'zustand/shallow'
import { useRouter } from 'next/navigation'

// Constants
import { API_URL } from '@/constants/constants'

// Icons
import CopyIcon from './icons/copy-icon'
import DeleteIcon from './icons/delete-icon'
import ShareIcon from './icons/share-icon'

// Store
import { userStore } from '@/store/userStore'

// Utils
import { showNotification } from '@/lib/utils'

export default function ActionButtonsLink ({ url }: { url: string }): JSX.Element {
  const router = useRouter()
  const { user } = userStore((state) => ({
    user: state.user
  }), shallow)

  const handleCopy = async (): Promise<void> => {
    await window.navigator.clipboard.writeText(url)
    showNotification('Link copiado', 'success')
  }

  const handleShare = async (): Promise<void> => {
    await navigator.share({
      title: 'Link acortado',
      text: 'Mira este link acortado',
      url
    })
  }
  const handleDelete = async (): Promise<void> => {
    const res = await fetch(`${API_URL}/urls/${url}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ userId: user.uid })
    })
    const data = await res.json()
    if (data.error == null) {
      showNotification('Link eliminado', 'success')
    } else {
      showNotification('Error al eliminar el link', 'error')
    }
    router.refresh()
  }

  return (
    <>
      <div className='flex gap-4'>
        <button onClick={handleCopy}><CopyIcon /></button>
        <button onClick={handleShare}><ShareIcon /></button>
        <button onClick={handleDelete}><DeleteIcon /></button>
      </div>
    </>
  )
}
