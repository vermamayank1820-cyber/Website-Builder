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
  projectSummary: null,
  version: 0,
  projectId: null,
  projectTitle: '',
  saveState: 'idle',
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
    setProjectSummary: (summary) => set({ projectSummary: summary }),
    setVersion: (version) => set({ version }),
    setProject: ({ id, title }) => set({ projectId: id, projectTitle: title }),
    setSaveState: (saveState) => set({ saveState }),
    hydrateProject: (snapshot) =>
      set({
        ...initialState,
        prompt: snapshot.prompt,
        code: snapshot.code,
        status: 'ready',
        messages: snapshot.messages,
        projectSummary: snapshot.projectSummary,
        version: snapshot.version,
        projectId: snapshot.projectId,
        projectTitle: snapshot.projectTitle,
        saveState: 'saved',
      }),
    reset: () => set(initialState),
  })
)
