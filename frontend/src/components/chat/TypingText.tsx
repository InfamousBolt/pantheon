import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'

interface TypingTextProps {
  text: string
  isStreaming?: boolean
  speed?: number
}

export default function TypingText({ text, isStreaming = false, speed = 20 }: TypingTextProps) {
  const [displayedText, setDisplayedText] = useState('')
  const [currentIndex, setCurrentIndex] = useState(0)
  const previousTextRef = useRef('')

  useEffect(() => {
    // If text is shorter than what we've displayed, reset
    if (text.length < displayedText.length) {
      setDisplayedText('')
      setCurrentIndex(0)
      previousTextRef.current = ''
      return
    }

    // If new text is added, animate only the new characters
    if (text.length > previousTextRef.current.length) {
      const startFrom = previousTextRef.current.length
      setCurrentIndex(startFrom)
      previousTextRef.current = text
    }
  }, [text])

  useEffect(() => {
    if (currentIndex < text.length) {
      const timer = setTimeout(() => {
        setDisplayedText(text.slice(0, currentIndex + 1))
        setCurrentIndex((prev) => prev + 1)
      }, speed)

      return () => clearTimeout(timer)
    }
  }, [currentIndex, text, speed])

  return (
    <span className="whitespace-pre-wrap">
      {displayedText}
      {isStreaming && currentIndex >= text.length && (
        <motion.span
          className="inline-block w-0.5 h-5 bg-accent ml-0.5 align-text-bottom"
          animate={{ opacity: [1, 0, 1] }}
          transition={{ duration: 1, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}
    </span>
  )
}
