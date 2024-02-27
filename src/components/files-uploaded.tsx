'use client'

import Link from 'next/link'

// Components
import DeleteFile from '@/components/delete-file'

// Types
import { type FileData } from '@/types/types'

export default function FilesUploaded ({ files }: { files: FileData[] }): JSX.Element {
  const handleShare = async (path: string): Promise<void> => {
    if (navigator.share != null) {
      await navigator.share({
        title: 'Compartir url de archivo',
        text: '¡Mirá este archivo!',
        url: `/${path}`
      })
    }
  }

  return (
    <>
      <section>
        <h2>Archivos</h2>
        <ul className='flex flex-wrap gap-4'>
          {
            files.length > 0
              ? files.map(file => {
                const type = file.type?.split('/')[0]
                const linkType = type === 'image' ? '/f/' : '/'
                const imageType = type === 'image' ? file.fileURL : '/pdf-icon.png'
                return (
                  <li key={file.link} className='flex flex-col gap-4'>
                    <DeleteFile pathId={file.link} fileName={file.fileName} type={type} />
                    <Link href={`${linkType}${file.link}`}>
                      <img className={`${type === 'image' ? ' w-[250px]' : 'w-[120px]'} h-auto object-cover`} src={imageType} alt='image' />
                      <span>{file.name}</span>
                      <span>{file.size}</span>
                      <small>{file.createdAt}</small>
                    </Link>
                    <button onClick={() => { void handleShare(file.link) }}>Share</button>
                  </li>
                )
              })
              : <span>No hay archivos</span>
          }
        </ul>
      </section>
    </>
  )
}
