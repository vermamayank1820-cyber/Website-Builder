import { z } from 'zod'

export const generateRequestSchema = z.object({
  prompt: z.string().trim().min(3).max(2000),
  /** When set, the project's business knowledge base grounds the generation. */
  projectId: z.string().uuid().optional(),
})

export const analyzeRequestSchema = z.object({
  projectId: z.string().uuid(),
  goal: z.string().trim().min(3).max(2000),
  url: z.string().trim().url().optional(),
})

export const agentRunRequestSchema = z.object({
  projectId: z.string().uuid(),
  kind: z.enum(['research', 'growth', 'design']),
})

export const editRequestSchema = z.object({
  prompt: z.string().trim().min(3).max(2000),
  currentCode: z.string().trim().min(1),
})

export type GenerateRequestBody = z.infer<typeof generateRequestSchema>
export type EditRequestBody = z.infer<typeof editRequestSchema>
