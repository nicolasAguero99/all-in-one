import { z } from 'zod'

// Utils
import { urlNoSpacesCheck } from '@/lib/utils'

export const inputFiles = z.object({
  file: z.any().refine(data => data?.length >= 1, {
    message: 'Archivo requerido'
  }),
  name: z.string().max(50, { message: 'Nombre demasiado largo' })
})

export const inputUrl = z.object({
  longUrl: z.string().url({
    message: 'No parece ser una URL válida'
  }).refine(urlNoSpacesCheck, {
    message: 'La url no puede contener espacios'
  })
})

export const inputQuantityTokens = z.object({
  quantity: z.string().refine(quantity => !isNaN(parseInt(quantity)), {
    message: 'Cantidad inválida, debe ser un número entero'
  }).refine(quantity => parseInt(quantity) > 0, {
    message: 'Cantidad mínima de 1 token'
  }).refine(quantity => parseInt(quantity) <= 50, {
    message: 'Cantidad máxima de 50 tokens'
  })
})
