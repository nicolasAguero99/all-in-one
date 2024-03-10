import { z } from 'zod'

// Utils
import { urlNoSpacesCheck } from '@/lib/utils'

const customUrl = z.string().optional().refine((customUrl: string | undefined) => customUrl === undefined || urlNoSpacesCheck(customUrl), {
  message: 'La URL no puede contener espacios'
}).refine(customUrl => customUrl === undefined || (String(customUrl).length >= 4 && String(customUrl).length <= 20), {
  message: 'La URL personalizada debe tener entre 4 y 20 caracteres'
})

export const inputFiles = z.object({
  file: z.any().refine(data => data?.length >= 1, {
    message: 'Archivo requerido'
  }),
  name: z.string().max(50, { message: 'Nombre demasiado largo' }),
  customUrl
})

export const inputUrl = z.object({
  longUrl: z.string().url({
    message: 'No parece ser una URL válida'
  }).refine(urlNoSpacesCheck, {
    message: 'La url no puede contener espacios'
  }),
  customUrl
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
