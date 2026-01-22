import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, ChevronRight, Brain, Search, CheckCircle2 } from 'lucide-react'
import { ThinkingStep } from '../../lib/api'

interface ThinkingPanelProps {
  steps: ThinkingStep[]
}

export default function ThinkingPanel({ steps }: ThinkingPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const getStepIcon = (step: ThinkingStep) => {
    if (step.title.toLowerCase().includes('search')) {
      return <Search className="w-3.5 h-3.5" />
    }
    if (step.status === 'complete') {
      return <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
    }
    return <Brain className="w-3.5 h-3.5" />
  }

  return (
    <div className="mb-4">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-2 text-sm text-foreground-muted hover:text-foreground
                   transition-colors"
      >
        {isExpanded ? (
          <ChevronDown className="w-4 h-4" />
        ) : (
          <ChevronRight className="w-4 h-4" />
        )}
        <span className="font-medium">Thinking</span>
        <span className="text-xs bg-accent/10 text-accent px-2 py-0.5 rounded-full border border-accent/30">
          {steps.length} steps
        </span>
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="mt-3 pl-4 border-l-2 border-accent/30 space-y-3">
              {steps.map((step, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-start gap-2"
                >
                  <div
                    className={`mt-0.5 ${
                      step.status === 'in_progress' ? 'pulse-dot' : ''
                    }`}
                  >
                    {getStepIcon(step)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {step.title}
                    </p>
                    <p className="text-xs text-foreground-muted mt-0.5">
                      {step.content}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
