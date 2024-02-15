import { z } from 'zod'

export const inputFiles = z.object({
  file: z.any().refine(data => data?.length >= 1, {
    message: 'Archivo requerido'
  })
})

export const inputUrl = z.object({
  longUrl: z.string().url({
    message: 'No parece ser una URL válida'
  })
})
