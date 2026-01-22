import { motion } from 'framer-motion'
import { Message } from '../../lib/api'
import UserMessage from './UserMessage'
import AssistantMessage from './AssistantMessage'

interface MessageListProps {
  messages: Message[]
}

export default function MessageList({ messages }: MessageListProps) {
  return (
    <div className="space-y-6">
      {messages.map((message, index) => (
        <motion.div
          key={message.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.3,
            delay: index === messages.length - 1 ? 0 : 0,
          }}
        >
          {message.role === 'user' ? (
            <UserMessage content={message.content} />
          ) : (
            <AssistantMessage
              content={message.content}
              thinkingSteps={message.thinking_steps}
              sources={message.sources}
            />
          )}
        </motion.div>
      ))}
    </div>
  )
}
