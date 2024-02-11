import { z } from 'zod'

export const inputFiles = z.object({
  file: z.any().refine(data => data?.length >= 1, {
    message: 'File is required'
  })
})
