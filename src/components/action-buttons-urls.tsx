'use client'

import { shallow } from 'zustand/shallow'
import { useRouter } from 'next/navigation'
import { type SetStateAction, type Dispatch } from 'react'

// Constants
import { API_URL, SERVICES_DATA } from '@/constants/constants'

// Icons
import CopyIcon from './icons/copy-icon'
import DeleteIcon from './icons/delete-icon'
import ShareIcon from './icons/share-icon'

// Store
import { userStore } from '@/store/userStore'

// Utils
import { showNotification } from '@/lib/utils'

export default function ActionButtonsLink ({ url, setUrl = null, service }: { url: string, setUrl?: Dispatch<SetStateAction<string>> | null, service: typeof SERVICES_DATA[number]['value'] }): JSX.Element {
  const router = useRouter()
  const { user } = userStore((state) => ({
    user: state.user
  }), shallow)
  const isUrlService = service === SERVICES_DATA[0].value

  const handleCopy = async (): Promise<void> => {
    const origin = window.location.origin
    await window.navigator.clipboard.writeText(`${origin}/${url}`)
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
    const apiLinkService = isUrlService ? 'urls' : 'qrs'
    const res = await fetch(`${API_URL}/${apiLinkService}/${url}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ userId: user.uid })
    })
    const data = await res.json()
    if (data.error == null) {
      showNotification('Link eliminado', 'success')
      if (setUrl !== null) setUrl('')
    } else {
      showNotification('Error al eliminar el link', 'error')
    }
    router.refresh()
  }

  return (
    <>
      <div className='flex gap-4'>
        {
          isUrlService && <>
            <button onClick={handleCopy}><CopyIcon /></button>
            <button onClick={handleShare}><ShareIcon color='ffffff' /></button>
          </>
        }
        <button className={isUrlService ? '' : 'shadow-md rounded-lg p-1 [&>svg]:size-6'} onClick={handleDelete}><DeleteIcon /></button>
      </div>
    </>
  )
}
