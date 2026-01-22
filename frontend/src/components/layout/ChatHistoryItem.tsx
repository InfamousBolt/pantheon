import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { MessageSquare, Trash2 } from 'lucide-react'
import { ChatListItem } from '../../lib/api'
import { useHistoryStore } from '../../stores/historyStore'

interface ChatHistoryItemProps {
  chat: ChatListItem
  isActive: boolean
}

export default function ChatHistoryItem({ chat, isActive }: ChatHistoryItemProps) {
  const navigate = useNavigate()
  const { deleteChat } = useHistoryStore()
  const [isHovered, setIsHovered] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleClick = () => {
    navigate(`/chat/${chat.id}`)
  }

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsDeleting(true)
    try {
      await deleteChat(chat.id)
      if (isActive) {
        navigate('/')
      }
    } catch (error) {
      console.error('Failed to delete chat:', error)
    }
    setIsDeleting(false)
  }

  const title = chat.title || 'New Chat'
  const truncatedTitle = title.length > 28 ? title.slice(0, 28) + '...' : title

  return (
    <motion.button
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-all ${
        isActive
          ? 'bg-accent/10 text-foreground border border-accent/30'
          : 'text-foreground-muted hover:bg-background-card hover:text-foreground border border-transparent hover:border-border'
      }`}
    >
      <MessageSquare className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-accent' : ''}`} />
      <span className="flex-1 truncate text-sm">{truncatedTitle}</span>

      {isHovered && !isDeleting && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          onClick={handleDelete}
          className="p-1 rounded hover:bg-background-card transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5 text-red-400" />
        </motion.button>
      )}

      {isDeleting && (
        <div className="w-3.5 h-3.5 border-2 border-foreground-muted border-t-transparent rounded-full animate-spin" />
      )}
    </motion.button>
  )
}
