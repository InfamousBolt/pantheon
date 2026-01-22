import { useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Share2, Check, Search } from 'lucide-react'
import { useChatStore } from '../stores/chatStore'
import MessageList from '../components/chat/MessageList'
import ChatInput from '../components/chat/ChatInput'
import TypingIndicator from '../components/chat/TypingIndicator'

export default function ChatPage() {
  const { chatId } = useParams<{ chatId: string }>()
  const { currentChat, streamingMessage, isLoading, loadChat, sendMessage, error } =
    useChatStore()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [shareClicked, setShareClicked] = useState(false)

  useEffect(() => {
    if (chatId) {
      loadChat(chatId)
    }
  }, [chatId, loadChat])

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [currentChat?.messages, streamingMessage?.content])

  const handleSendMessage = (content: string) => {
    if (content.trim()) {
      sendMessage(content)
    }
  }

  const handleShare = async () => {
    const shareUrl = window.location.href
    try {
      await navigator.clipboard.writeText(shareUrl)
      setShareClicked(true)
      setTimeout(() => setShareClicked(false), 2000)
    } catch (err) {
      // Fallback for browsers that don't support clipboard API
      const textArea = document.createElement('textarea')
      textArea.value = shareUrl
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      setShareClicked(true)
      setTimeout(() => setShareClicked(false), 2000)
    }
  }

  if (isLoading && !currentChat) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (error && !currentChat) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-2">{error}</p>
          <p className="text-foreground-muted text-sm">
            Please try refreshing the page.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Header with Share Button */}
      <div className="border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-accent/10 border border-accent/30 flex items-center justify-center">
              <Search className="w-4 h-4 text-accent" />
            </div>
            <h1 className="font-medium text-foreground truncate max-w-[300px]">
              {currentChat?.title || 'Research Chat'}
            </h1>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleShare}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium
                       transition-all duration-200 ${
                         shareClicked
                           ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                           : 'bg-accent text-white hover:bg-accent-hover'
                       }`}
          >
            {shareClicked ? (
              <>
                <Check className="w-4 h-4" />
                Link Copied!
              </>
            ) : (
              <>
                <Share2 className="w-4 h-4" />
                Share Chat
              </>
            )}
          </motion.button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-4 py-8">
          <AnimatePresence mode="popLayout">
            {currentChat && (
              <MessageList messages={currentChat.messages} />
            )}

            {/* Streaming message */}
            {streamingMessage && streamingMessage.isStreaming && (
              <motion.div
                key="streaming"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                {streamingMessage.content ? (
                  <div className="mb-6">
                    <div className="flex gap-4">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent to-accent-hover flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-sm font-medium">A</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        {streamingMessage.thinking_steps.length > 0 && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="mb-4 p-3 rounded-lg bg-accent/5 border border-accent/20"
                          >
                            {streamingMessage.thinking_steps.map((step, i) => (
                              <div
                                key={i}
                                className="flex items-center gap-2 text-sm text-foreground-muted mb-1 last:mb-0"
                              >
                                {step.status === 'in_progress' ? (
                                  <motion.div
                                    className="w-2 h-2 rounded-full bg-accent"
                                    animate={{ scale: [1, 1.2, 1], opacity: [1, 0.7, 1] }}
                                    transition={{ duration: 1, repeat: Infinity }}
                                  />
                                ) : (
                                  <div className="w-2 h-2 rounded-full bg-green-500" />
                                )}
                                <span>{step.title}</span>
                              </div>
                            ))}
                          </motion.div>
                        )}
                        <div className="prose prose-invert max-w-none">
                          <p className="text-foreground whitespace-pre-wrap leading-relaxed">
                            {streamingMessage.content}
                            <motion.span
                              className="inline-block w-0.5 h-5 bg-accent ml-1 align-text-bottom"
                              animate={{ opacity: [1, 0, 1] }}
                              transition={{ duration: 1, repeat: Infinity, ease: 'easeInOut' }}
                            />
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="mb-6">
                    <div className="flex gap-4">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent to-accent-hover flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-sm font-medium">A</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        {streamingMessage.thinking_steps.length > 0 ? (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="p-3 rounded-lg bg-accent/5 border border-accent/20"
                          >
                            {streamingMessage.thinking_steps.map((step, i) => (
                              <div
                                key={i}
                                className="flex items-center gap-2 text-sm text-foreground-muted mb-1 last:mb-0"
                              >
                                {step.status === 'in_progress' ? (
                                  <motion.div
                                    className="w-2 h-2 rounded-full bg-accent"
                                    animate={{ scale: [1, 1.2, 1], opacity: [1, 0.7, 1] }}
                                    transition={{ duration: 1, repeat: Infinity }}
                                  />
                                ) : (
                                  <div className="w-2 h-2 rounded-full bg-green-500" />
                                )}
                                <span>{step.title}</span>
                              </div>
                            ))}
                          </motion.div>
                        ) : (
                          <TypingIndicator />
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="border-t border-border bg-background">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <ChatInput
            onSend={handleSendMessage}
            disabled={streamingMessage?.isStreaming}
          />
        </div>
      </div>
    </div>
  )
}
