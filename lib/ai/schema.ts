import { z } from 'zod'

export const generateRequestSchema = z.object({
  prompt: z.string().trim().min(3).max(2000),
})

export const editRequestSchema = z.object({
  prompt: z.string().trim().min(3).max(2000),
  currentCode: z.string().trim().min(1),
})

export type GenerateRequestBody = z.infer<typeof generateRequestSchema>
export type EditRequestBody = z.infer<typeof editRequestSchema>
