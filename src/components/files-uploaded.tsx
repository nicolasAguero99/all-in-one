'use client'

import Link from 'next/link'

// Components
import DeleteFile from '@/components/delete-file'
import FormFiles from '@/components/form-files'
import PaymentBtn from '@/components/payment-btn'

// Types
import { type FileData } from '@/types/types'

// Utils
import { filesSizesToKb, formattedDate } from '@/lib/utils'

// Icons
import ShareIcon from './icons/share-icon'

// Constants
import { FILE_TYPES } from '@/constants/constants'

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
    <main className='flex flex-col gap-4 py-6'>
      <h1 className='text-6xl font-semibold text-center'>Subir archivos</h1>
      <PaymentBtn />
      <FormFiles />
      <section className='flex flex-col items-center'>
        <h2 className='my-6'>Archivos</h2>
        <ul className='flex flex-wrap justify-center items-center gap-4 px-16'>
          {
            files.length > 0
              ? files.map(file => {
                const type = file.type?.split('/')[0]
                const extension = file.type?.split('/')[1]
                const linkType = (type === FILE_TYPES.IMAGE || type === FILE_TYPES.VIDEO) ? '/f/' : '/'
                const fileSrc = (type === FILE_TYPES.IMAGE || type === FILE_TYPES.VIDEO) ? file.fileURL : '/pdf-icon.png'
                const [day, month] = formattedDate(file.createdAt)
                const sizeFormatted = filesSizesToKb(file.size)
                return (
                  <li key={file.link} className='relative flex flex-col overflow-hidden rounded-t-lg'>
                    <DeleteFile pathId={file.link} fileName={file.fileName} type={type} />
                    <Link href={`${linkType}${file.link}`} className='[&>img]:hover:scale-110'>
                      {
                        type === FILE_TYPES.IMAGE
                          ? <img className={`${type === FILE_TYPES.IMAGE ? ' w-[250px] h-[150px]' : 'size-[120px]'} object-cover transition-transform ease-out duration-300 z-10`} src={fileSrc} alt='image uploaded' />
                          : <video className='w-[250px] h-[150px] object-cover transition-transform ease-out duration-300 z-10' controls>
                            <source src={fileSrc} type={`video/${extension}`} />
                          </video>
                      }
                    </Link>
                      <div className='relative flex flex-col gap-2 p-4 pt-8 bg-slate-50 rounded-b-lg z-20'>
                        <span className='text-black font-semibold capitalize'>{file.name}</span>
                        <div className='flex justify-between items-center gap-4'>
                          <span className='text-gray-500 text-sm'>{sizeFormatted} kb</span>
                          <button className='shadow-md rounded-lg p-1 [&>svg]:size-6' onClick={() => { void handleShare(file.link) }}><ShareIcon color={'000000'} /></button>
                        </div>
                        <small className='absolute -top-7 flex flex-col items-center py-1 px-4 rounded-lg text-black bg-white capitalize shadow-sm'>
                          <span className='text-base font-semibold'>{day}</span>
                          <span className='font-medium'>{month}</span>
                        </small>
                      </div>
                  </li>
                )
              })
              : <span>No hay archivos</span>
          }
        </ul>
      </section>
    </main>
  )
}
