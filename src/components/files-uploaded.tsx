'use client'

import Link from 'next/link'
import { shallow } from 'zustand/shallow'

// Components
import DeleteFile from '@/components/delete-file'
import FormFiles from '@/components/form-files'

// Types
import { type FileData } from '@/types/types'

// Utils
import { filesSizesToKb, formattedDate } from '@/lib/utils'

// Icons
import ShareIcon from './icons/share-icon'

// Constants
import { FILE_TYPES } from '@/constants/constants'

// Illustration
import RobotIllustration from './illustrations/robot-illustration'

// Store
import { errorStore } from '@/store/errorStore'
import { userStore } from '@/store/userStore'

export default function FilesUploaded ({ files, children }: { files: FileData[], children?: JSX.Element[] }): JSX.Element {
  const { user } = userStore((state) => ({
    user: state.user
  }), shallow)

  const { error } = errorStore((state) => ({
    error: state.error
  }), shallow)

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
    <main className='flex flex-col justify-center gap-4 py-6 px-6'>
      <div className='m-auto relative'>
        <RobotIllustration error={error !== ''} />
        {error !== '' && <span className='absolute top-0 bottom-0 my-auto -right-[320px] w-[300px] size-fit bg-primary text-bckg font-medium px-4 py-2 rounded-full shadow-lg before:absolute before:top-0 before:bottom-0 before:m-auto before:-left-[10px] before:size-4 before:bg-primary custom-clip-path-msg'>{error}</span>}
      </div>
      <h1 className='text-xl font-semibold text-center'>¿Qué vamos a hacer hoy?</h1>
      {children}
      <FormFiles />
      {
        user.uid === ''
          ? null
          : <section className='flex flex-col gap-4 w-full max-w-[1000px] bg-bckg m-auto rounded-lg shadow-md shadow-[#ffffff]/5 p-6 mt-6'>
            <h2 className='flex gap-1 items-center text-xl font-semibold'>
              <img src="/icons/image-icon.svg" alt="image icon" />
              Archivos recientes
            </h2>
            <ul className='flex flex-wrap justify-center items-center gap-8 mt-8'>
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
                      <li key={file.link} className='relative flex flex-col overflow-hidden rounded-t-lg max-w-[250px]'>
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
                            <span className='text-black font-semibold capitalize w-[95%] text-ellipsis whitespace-nowrap overflow-x-hidden'>{file.name}</span>
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
                  : <span className='text-center text-xl text-primary/50 py-6'>No hay archivos</span>
              }
            </ul>
          </section>
      }
    </main>
  )
}
