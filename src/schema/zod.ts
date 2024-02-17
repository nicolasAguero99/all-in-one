import { z } from 'zod'

export const inputFiles = z.object({
  file: z.any().refine(data => data?.length >= 1, {
    message: 'Archivo requerido'
  }),
  name: z.string().max(50, { message: 'Nombre demasiado largo' })
})

export const inputUrl = z.object({
  longUrl: z.string().url({
    message: 'No parece ser una URL válida'
  })
})
