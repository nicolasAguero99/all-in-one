// Constants
import { API_URL } from '@/constants/constants'

export default function PdfAdd (): JSX.Element {
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    console.log('formData', formData)

    const res = await fetch(`${API_URL}/files`, {
      method: 'POST',
      body: formData
    })
    const data = await res.json()
    console.log(data)
  }

  return (
    <div>
      <h2>Subir PDF</h2>
      <form onSubmit={handleSubmit} method='post' encType='multipart/form-data'>
        <input type='file' name='file' />
        <button type='submit'>Subir</button>
      </form>
      {/* {
        pdfUrl !== '' && (
          <div>
            <span>Nuevo PDF:</span>
            <a href={pdfUrl} >PDF</a>
          </div>
        )
      } */}
    </div>
  )
}
