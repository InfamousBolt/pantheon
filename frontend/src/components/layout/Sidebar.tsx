import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, PanelLeftClose, PanelLeft, Trash2 } from 'lucide-react'
import { useHistoryStore, groupChatsByDate } from '../../stores/historyStore'
import { useChatStore } from '../../stores/chatStore'
import ChatHistoryItem from './ChatHistoryItem'

export default function Sidebar() {
  const navigate = useNavigate()
  const { chatId } = useParams()
  const { chats, sidebarOpen, toggleSidebar, clearAllChats } = useHistoryStore()
  const { createChat } = useChatStore()
  const { addChat } = useHistoryStore()
  const [showConfirm, setShowConfirm] = useState(false)
  const [isClearing, setIsClearing] = useState(false)

  const groupedChats = groupChatsByDate(chats)

  const handleNewChat = async () => {
    try {
      const chat = await createChat()
      addChat({
        id: chat.id,
        title: chat.title,
        created_at: chat.created_at,
        updated_at: chat.updated_at,
      })
      navigate(`/chat/${chat.id}`)
    } catch (error) {
      console.error('Failed to create chat:', error)
    }
  }

  const handleClearHistory = async () => {
    setIsClearing(true)
    try {
      await clearAllChats()
      setShowConfirm(false)
      navigate('/')
    } catch (error) {
      console.error('Failed to clear history:', error)
    }
    setIsClearing(false)
  }

  return (
    <>
      {/* Toggle button when sidebar is closed */}
      <AnimatePresence>
        {!sidebarOpen && (
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            onClick={toggleSidebar}
            className="fixed top-4 left-4 z-50 p-2 rounded-lg bg-background-sidebar border border-border hover:border-accent/50 transition-colors"
          >
            <PanelLeft className="w-5 h-5 text-foreground-muted" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.aside
            initial={{ x: -260 }}
            animate={{ x: 0 }}
            exit={{ x: -260 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 left-0 h-full w-64 bg-background-sidebar border-r border-border flex flex-col z-40"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <button
                onClick={handleNewChat}
                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-accent hover:bg-accent-hover transition-colors text-sm font-medium text-white"
              >
                <Plus className="w-4 h-4" />
                New Chat
              </button>
              <button
                onClick={toggleSidebar}
                className="p-2 rounded-lg hover:bg-background-card transition-colors"
              >
                <PanelLeftClose className="w-5 h-5 text-foreground-muted" />
              </button>
            </div>

            {/* Chat History */}
            <div className="flex-1 overflow-y-auto py-2">
              {groupedChats.map((group) => (
                <div key={group.label} className="mb-4">
                  <h3 className="px-4 py-2 text-xs font-medium text-foreground-muted uppercase tracking-wider">
                    {group.label}
                  </h3>
                  <div className="space-y-1 px-2">
                    {group.chats.map((chat) => (
                      <ChatHistoryItem
                        key={chat.id}
                        chat={chat}
                        isActive={chat.id === chatId}
                      />
                    ))}
                  </div>
                </div>
              ))}

              {chats.length === 0 && (
                <div className="px-4 py-8 text-center text-foreground-muted text-sm">
                  No conversations yet.
                  <br />
                  Start a new chat!
                </div>
              )}
            </div>

            {/* Clear History Button */}
            {chats.length > 0 && (
              <div className="p-4 border-t border-border">
                {showConfirm ? (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-2"
                  >
                    <p className="text-sm text-foreground-muted text-center mb-3">
                      Delete all {chats.length} conversation{chats.length > 1 ? 's' : ''}?
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setShowConfirm(false)}
                        disabled={isClearing}
                        className="flex-1 px-3 py-2 rounded-lg text-sm font-medium
                                   bg-background-card border border-border hover:border-foreground-muted
                                   transition-colors disabled:opacity-50"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleClearHistory}
                        disabled={isClearing}
                        className="flex-1 px-3 py-2 rounded-lg text-sm font-medium
                                   bg-red-500/20 text-red-400 border border-red-500/30
                                   hover:bg-red-500/30 transition-colors disabled:opacity-50"
                      >
                        {isClearing ? (
                          <span className="flex items-center justify-center gap-2">
                            <div className="w-3 h-3 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                            Clearing...
                          </span>
                        ) : (
                          'Delete All'
                        )}
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <button
                    onClick={() => setShowConfirm(true)}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm
                               text-foreground-muted hover:text-red-400 hover:bg-red-500/10
                               border border-transparent hover:border-red-500/30 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                    Clear History
                  </button>
                )}
              </div>
            )}
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={toggleSidebar}
            className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          />
        )}
      </AnimatePresence>
    </>
  )
}
