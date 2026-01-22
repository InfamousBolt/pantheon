import { useState, useRef, useEffect, KeyboardEvent } from 'react'
import { ArrowUpRight } from 'lucide-react'

interface ChatInputProps {
  onSend: (message: string) => void
  disabled?: boolean
}

export default function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [input, setInput] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = 'auto'
      textarea.style.height = `${Math.min(textarea.scrollHeight, 150)}px`
    }
  }, [input])

  const handleSubmit = () => {
    if (input.trim() && !disabled) {
      onSend(input.trim())
      setInput('')
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <div className="relative rounded-2xl border-2 border-accent bg-background-card p-4 transition-all duration-200">
      <textarea
        ref={textareaRef}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Ask a follow-up question..."
        disabled={disabled}
        rows={1}
        className="w-full bg-transparent text-foreground placeholder:text-foreground-muted resize-none
                   focus:outline-none disabled:opacity-50 text-base"
      />

      {/* Bottom bar */}
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
        <span className="text-foreground-muted text-sm">{input.length}/10000</span>

        <button
          onClick={handleSubmit}
          disabled={!input.trim() || disabled}
          className="p-2.5 rounded-xl bg-foreground text-background
                     hover:bg-foreground/90 disabled:opacity-30 disabled:cursor-not-allowed
                     transition-all duration-200"
        >
          {disabled ? (
            <div className="w-4 h-4 border-2 border-background border-t-transparent rounded-full animate-spin" />
          ) : (
            <ArrowUpRight className="w-4 h-4" />
          )}
        </button>
      </div>
    </div>
  )
}
