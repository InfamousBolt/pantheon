import { create } from 'zustand'
import { api, Chat, Message, ThinkingStep, Source } from '../lib/api'

interface StreamingMessage {
  content: string
  thinking_steps: ThinkingStep[]
  sources: Source[]
  isStreaming: boolean
}

interface ChatState {
  currentChat: Chat | null
  streamingMessage: StreamingMessage | null
  isLoading: boolean
  error: string | null

  // Actions
  loadChat: (chatId: string) => Promise<void>
  createChat: () => Promise<Chat>
  sendMessage: (content: string) => Promise<void>
  clearChat: () => void
  setError: (error: string | null) => void
}

export const useChatStore = create<ChatState>((set, get) => ({
  currentChat: null,
  streamingMessage: null,
  isLoading: false,
  error: null,

  loadChat: async (chatId: string) => {
    set({ isLoading: true, error: null })
    try {
      const chat = await api.getChat(chatId)
      set({ currentChat: chat, isLoading: false })
    } catch (error) {
      set({ error: 'Failed to load chat', isLoading: false })
    }
  },

  createChat: async () => {
    set({ isLoading: true, error: null })
    try {
      const chat = await api.createChat()
      set({ currentChat: chat, isLoading: false })
      return chat
    } catch (error) {
      set({ error: 'Failed to create chat', isLoading: false })
      throw error
    }
  },

  sendMessage: async (content: string) => {
    const { currentChat } = get()
    if (!currentChat) return

    // Add user message optimistically
    const userMessage: Message = {
      id: crypto.randomUUID(),
      chat_id: currentChat.id,
      role: 'user',
      content,
      thinking_steps: [],
      sources: [],
      created_at: new Date().toISOString(),
    }

    set({
      currentChat: {
        ...currentChat,
        messages: [...currentChat.messages, userMessage],
      },
      streamingMessage: {
        content: '',
        thinking_steps: [],
        sources: [],
        isStreaming: true,
      },
      error: null,
    })

    // Start SSE connection
    const eventSource = api.sendMessage(currentChat.id, content)

    eventSource.addEventListener('thinking', ((event: CustomEvent) => {
      const { step } = event.detail
      set((state) => ({
        streamingMessage: state.streamingMessage
          ? {
              ...state.streamingMessage,
              thinking_steps: updateThinkingSteps(
                state.streamingMessage.thinking_steps,
                step
              ),
            }
          : null,
      }))
    }) as EventListener)

    eventSource.addEventListener('tool_call', ((_event: CustomEvent) => {
      // Tool call events are shown via thinking steps
    }) as EventListener)

    eventSource.addEventListener('tool_result', ((_event: CustomEvent) => {
      // Tool results are shown via thinking steps
    }) as EventListener)

    eventSource.addEventListener('content', ((event: CustomEvent) => {
      const { delta } = event.detail
      set((state) => ({
        streamingMessage: state.streamingMessage
          ? {
              ...state.streamingMessage,
              content: state.streamingMessage.content + delta,
            }
          : null,
      }))
    }) as EventListener)

    eventSource.addEventListener('sources', ((event: CustomEvent) => {
      const { sources } = event.detail
      set((state) => ({
        streamingMessage: state.streamingMessage
          ? {
              ...state.streamingMessage,
              sources,
            }
          : null,
      }))
    }) as EventListener)

    eventSource.addEventListener('complete', ((event: CustomEvent) => {
      const state = get()
      const { streamingMessage, currentChat } = state

      if (streamingMessage && currentChat) {
        const assistantMessage: Message = {
          id: event.detail.message_id,
          chat_id: currentChat.id,
          role: 'assistant',
          content: streamingMessage.content,
          thinking_steps: streamingMessage.thinking_steps,
          sources: streamingMessage.sources,
          created_at: new Date().toISOString(),
        }

        set({
          currentChat: {
            ...currentChat,
            messages: [...currentChat.messages, assistantMessage],
          },
          streamingMessage: null,
        })
      }

      eventSource.close()
    }) as EventListener)

    eventSource.addEventListener('error', ((event: CustomEvent) => {
      set({
        streamingMessage: null,
        error: event.detail?.message || 'An error occurred',
      })
      eventSource.close()
    }) as EventListener)

    eventSource.addEventListener('close', () => {
      // Connection closed
    })
  },

  clearChat: () => {
    set({ currentChat: null, streamingMessage: null, error: null })
  },

  setError: (error: string | null) => {
    set({ error })
  },
}))

// Helper to update thinking steps (replace if same title, add if new)
function updateThinkingSteps(
  steps: ThinkingStep[],
  newStep: ThinkingStep
): ThinkingStep[] {
  const existingIndex = steps.findIndex((s) => s.title === newStep.title)
  if (existingIndex >= 0) {
    const updated = [...steps]
    updated[existingIndex] = newStep
    return updated
  }
  return [...steps, newStep]
}
