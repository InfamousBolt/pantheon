import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { motion } from 'framer-motion'
import { Copy, Check, Share2 } from 'lucide-react'
import { ThinkingStep, Source } from '../../lib/api'
import ThinkingPanel from './ThinkingPanel'
import SourceCard from './SourceCard'

interface AssistantMessageProps {
  content: string
  thinkingSteps: ThinkingStep[]
  sources: Source[]
}

export default function AssistantMessage({
  content,
  thinkingSteps,
  sources,
}: AssistantMessageProps) {
  const [copied, setCopied] = useState(false)
  const [urlCopied, setUrlCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleShare = async () => {
    await navigator.clipboard.writeText(window.location.href)
    setUrlCopied(true)
    setTimeout(() => setUrlCopied(false), 2000)
  }

  return (
    <div className="flex gap-4">
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent to-accent-hover flex items-center justify-center flex-shrink-0">
        <span className="text-white text-sm font-medium">A</span>
      </div>

      <div className="flex-1 min-w-0">
        {/* Thinking Panel */}
        {thinkingSteps.length > 0 && (
          <ThinkingPanel steps={thinkingSteps} />
        )}

        {/* Content */}
        <div className="markdown-content">
          <ReactMarkdown>{content}</ReactMarkdown>
        </div>

        {/* Sources */}
        {sources.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-4"
          >
            <p className="text-xs text-foreground-muted mb-2 uppercase tracking-wider font-medium">
              Sources
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {sources.map((source, index) => (
                <SourceCard key={index} source={source} index={index + 1} />
              ))}
            </div>
          </motion.div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2 mt-4">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs
                       text-foreground-muted hover:text-foreground hover:bg-background-card
                       border border-transparent hover:border-border transition-all"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-green-500" />
                Copied
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                Copy
              </>
            )}
          </button>

          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs
                       text-foreground-muted hover:text-foreground hover:bg-background-card
                       border border-transparent hover:border-border transition-all"
          >
            {urlCopied ? (
              <>
                <Check className="w-3.5 h-3.5 text-green-500" />
                Link copied
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5" />
                Share
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
