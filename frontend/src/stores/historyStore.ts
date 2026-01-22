import { create } from 'zustand'
import { api, ChatListItem } from '../lib/api'

interface HistoryState {
  chats: ChatListItem[]
  isLoading: boolean
  error: string | null
  sidebarOpen: boolean

  // Actions
  loadChats: () => Promise<void>
  deleteChat: (chatId: string) => Promise<void>
  clearAllChats: () => Promise<void>
  addChat: (chat: ChatListItem) => void
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
}

export const useHistoryStore = create<HistoryState>((set) => ({
  chats: [],
  isLoading: false,
  error: null,
  sidebarOpen: true,

  loadChats: async () => {
    set({ isLoading: true, error: null })
    try {
      const chats = await api.listChats()
      set({ chats, isLoading: false })
    } catch (error) {
      set({ error: 'Failed to load chats', isLoading: false })
    }
  },

  deleteChat: async (chatId: string) => {
    try {
      await api.deleteChat(chatId)
      set((state) => ({
        chats: state.chats.filter((c) => c.id !== chatId),
      }))
    } catch (error) {
      set({ error: 'Failed to delete chat' })
    }
  },

  clearAllChats: async () => {
    try {
      await api.clearAllChats()
      set({ chats: [] })
    } catch (error) {
      set({ error: 'Failed to clear chats' })
    }
  },

  addChat: (chat: ChatListItem) => {
    set((state) => ({
      chats: [chat, ...state.chats],
    }))
  },

  toggleSidebar: () => {
    set((state) => ({ sidebarOpen: !state.sidebarOpen }))
  },

  setSidebarOpen: (open: boolean) => {
    set({ sidebarOpen: open })
  },
}))

// Helper to group chats by date
export function groupChatsByDate(chats: ChatListItem[]) {
  const groups: { label: string; chats: ChatListItem[] }[] = []
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000)
  const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)

  const todayChats: ChatListItem[] = []
  const yesterdayChats: ChatListItem[] = []
  const lastWeekChats: ChatListItem[] = []
  const olderChats: ChatListItem[] = []

  for (const chat of chats) {
    const chatDate = new Date(chat.updated_at)
    if (chatDate >= today) {
      todayChats.push(chat)
    } else if (chatDate >= yesterday) {
      yesterdayChats.push(chat)
    } else if (chatDate >= lastWeek) {
      lastWeekChats.push(chat)
    } else {
      olderChats.push(chat)
    }
  }

  if (todayChats.length > 0) {
    groups.push({ label: 'Today', chats: todayChats })
  }
  if (yesterdayChats.length > 0) {
    groups.push({ label: 'Yesterday', chats: yesterdayChats })
  }
  if (lastWeekChats.length > 0) {
    groups.push({ label: 'Previous 7 Days', chats: lastWeekChats })
  }
  if (olderChats.length > 0) {
    groups.push({ label: 'Older', chats: olderChats })
  }

  return groups
}
