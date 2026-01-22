import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowUpRight, Search } from 'lucide-react'
import { useChatStore } from '../stores/chatStore'
import { useHistoryStore } from '../stores/historyStore'
import SuggestionCards from '../components/ui/SuggestionCards'

export default function HomePage() {
  const navigate = useNavigate()
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { createChat, sendMessage } = useChatStore()
  const { addChat } = useHistoryStore()

  const handleSubmit = async (message: string) => {
    if (!message.trim() || isLoading) return

    setIsLoading(true)
    try {
      const chat = await createChat()
      addChat({
        id: chat.id,
        title: chat.title,
        created_at: chat.created_at,
        updated_at: chat.updated_at,
      })
      navigate(`/chat/${chat.id}`)
      // Send message after navigation
      setTimeout(() => {
        sendMessage(message)
      }, 100)
    } catch (error) {
      console.error('Failed to start chat:', error)
      setIsLoading(false)
    }
  }

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleSubmit(input)
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-3xl text-center"
      >
        {/* Logo Icon */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
          className="mb-8"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-accent/20 to-accent/5 border border-accent/30">
            <Search className="w-10 h-10 text-accent" strokeWidth={1.5} />
          </div>
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-4xl md:text-5xl font-bold mb-12 text-foreground"
        >
          How can I help you today?
        </motion.h1>

        {/* Main Input Area */}
        <motion.form
          onSubmit={handleFormSubmit}
          className="mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="relative rounded-2xl border-2 border-accent bg-background-card p-4 shadow-lg shadow-accent/5">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleFormSubmit(e)
                }
              }}
              placeholder="Ask me anything..."
              disabled={isLoading}
              rows={3}
              className="w-full bg-transparent text-foreground placeholder:text-foreground-muted
                         focus:outline-none resize-none text-lg"
            />

            {/* Bottom bar with character count and submit button */}
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
              <div className="flex items-center gap-4 text-foreground-muted text-sm">
                <span>{input.length}/10000</span>
              </div>

              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="p-3 rounded-xl bg-foreground text-background
                           hover:bg-foreground/90 disabled:opacity-30 disabled:cursor-not-allowed
                           transition-all duration-200"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-background border-t-transparent rounded-full animate-spin" />
                ) : (
                  <ArrowUpRight className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </motion.form>

        {/* Suggestion Cards */}
        <SuggestionCards onSelect={handleSubmit} />
      </motion.div>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="absolute bottom-8 text-foreground-muted text-sm"
      >
        Research Agent - AI-powered search
      </motion.footer>
    </div>
  )
}
