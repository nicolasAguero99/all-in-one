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

export const inputQuantityTokens = z.object({
  quantity: z.string().refine(quantity => !isNaN(parseInt(quantity)), {
    message: 'Debe ser un número'
  }).refine(quantity => parseInt(quantity) > 0, {
    message: 'Debe ser mayor a 0'
  }).refine(quantity => parseInt(quantity) <= 100, {
    message: 'Debe ser menor o igual a 100'
  })
})
