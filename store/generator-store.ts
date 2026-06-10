import { create } from 'zustand'

import type { GeneratorActions, GeneratorState } from '@/types'

const initialState: GeneratorState = {
  prompt: '',
  code: '',
  status: 'idle',
  error: null,
  streamBuffer: '',
  messages: [],
  lastGeneratedAt: null,
}

export const useGeneratorStore = create<GeneratorState & GeneratorActions>(
  (set) => ({
    ...initialState,
    setPrompt: (prompt) => set({ prompt }),
    setCode: (code) => set({ code }),
    setStatus: (status) => set({ status }),
    setError: (error) => set({ error }),
    appendStream: (chunk) =>
      set((state) => ({ streamBuffer: state.streamBuffer + chunk })),
    resetStream: () => set({ streamBuffer: '' }),
    addMessage: (message) =>
      set((state) => ({ messages: [...state.messages, message] })),
    updateMessage: (id, update) =>
      set((state) => ({
        messages: state.messages.map((message) =>
          message.id === id ? { ...message, ...update } : message
        ),
      })),
    setLastGeneratedAt: (timestamp) => set({ lastGeneratedAt: timestamp }),
    reset: () => set(initialState),
  })
)
