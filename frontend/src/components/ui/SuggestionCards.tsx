import { motion } from 'framer-motion'
import { Globe, Code, Cpu, ArrowUpRight } from 'lucide-react'

interface SuggestionCardsProps {
  onSelect: (prompt: string) => void
}

const suggestions = [
  {
    icon: Globe,
    title: 'Latest News',
    prompt: 'What are the top technology news stories today?',
    color: 'text-accent',
  },
  {
    icon: Code,
    title: 'Code Help',
    prompt: 'Explain how React hooks work and best practices',
    color: 'text-accent',
    featured: true,
  },
  {
    icon: Cpu,
    title: 'AI Research',
    prompt: 'What are the latest breakthroughs in AI?',
    color: 'text-accent',
  },
]

export default function SuggestionCards({ onSelect }: SuggestionCardsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="grid grid-cols-1 md:grid-cols-3 gap-4"
    >
      {suggestions.map((suggestion, index) => {
        const Icon = suggestion.icon
        const isFeatured = suggestion.featured

        return (
          <motion.button
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 + index * 0.1 }}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelect(suggestion.prompt)}
            className={`relative p-5 rounded-xl text-left transition-all duration-300 group
              ${isFeatured
                ? 'bg-accent text-white border-2 border-accent'
                : 'bg-background-card border-2 border-border hover:border-accent/50'
              }`}
          >
            {/* Arrow indicator */}
            <div className={`absolute top-4 right-4 ${isFeatured ? 'text-white/80' : 'text-accent'}`}>
              <ArrowUpRight className="w-4 h-4" />
            </div>

            {/* Icon and Title */}
            <div className="flex items-center gap-3 mb-3">
              <Icon className={`w-5 h-5 ${isFeatured ? 'text-white' : suggestion.color}`} />
              <span className={`font-semibold ${isFeatured ? 'text-white' : 'text-foreground'}`}>
                {suggestion.title}
              </span>
            </div>

            {/* Prompt preview */}
            <p className={`text-sm line-clamp-2 ${isFeatured ? 'text-white/80' : 'text-foreground-muted'}`}>
              {suggestion.prompt}
            </p>
          </motion.button>
        )
      })}
    </motion.div>
  )
}
