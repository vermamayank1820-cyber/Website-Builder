import { z } from 'zod'

import { MAX_INPUT_CHARS, MIN_INPUT_CHARS } from '@/lib/input/constants'

const userInput = z.string().trim().min(MIN_INPUT_CHARS).max(MAX_INPUT_CHARS)

export const generateRequestSchema = z.object({
  prompt: userInput,
  /** When set, the project's business knowledge base grounds the generation. */
  projectId: z.string().uuid().optional(),
})

export const analyzeRequestSchema = z.object({
  projectId: z.string().uuid(),
  goal: userInput,
  url: z.string().trim().url().optional(),
})

export const agentRunRequestSchema = z.object({
  projectId: z.string().uuid(),
  kind: z.enum(['research', 'growth', 'design']),
})

export const editRequestSchema = z.object({
  prompt: userInput,
  currentCode: z.string().trim().min(1),
})

export type GenerateRequestBody = z.infer<typeof generateRequestSchema>
export type EditRequestBody = z.infer<typeof editRequestSchema>
