import { motion } from 'framer-motion'

interface ExamplePromptsProps {
  onSelect: (prompt: string) => void
}

const examples = [
  {
    title: 'Latest AI breakthroughs',
    prompt: 'What are the latest breakthroughs in AI research?',
  },
  {
    title: 'Compare React vs Vue',
    prompt: 'Compare React and Vue.js in 2024 - pros, cons, and when to use each',
  },
  {
    title: 'Explain quantum computing',
    prompt: 'Explain quantum computing in simple terms - how does it work?',
  },
  {
    title: 'TypeScript best practices',
    prompt: 'What are the current best practices for TypeScript in large projects?',
  },
]

export default function ExamplePrompts({ onSelect }: ExamplePromptsProps) {
  return (
    <div>
      <p className="text-foreground-muted text-sm mb-4">Try these:</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {examples.map((example, index) => (
          <motion.button
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + index * 0.1 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelect(example.prompt)}
            className="p-4 rounded-xl bg-background-card border border-zinc-800
                       hover:border-accent/50 hover:bg-background-card/80
                       text-left transition-all duration-200 group"
          >
            <p className="text-foreground text-sm font-medium group-hover:text-accent transition-colors">
              {example.title}
            </p>
          </motion.button>
        ))}
      </div>
    </div>
  )
}
