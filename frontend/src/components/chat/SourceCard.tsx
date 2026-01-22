import { motion } from 'framer-motion'
import { ExternalLink, Globe } from 'lucide-react'
import { Source } from '../../lib/api'

interface SourceCardProps {
  source: Source
  index: number
}

export default function SourceCard({ source, index }: SourceCardProps) {
  return (
    <motion.a
      href={source.url}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ scale: 1.02 }}
      className="flex items-start gap-3 p-3 rounded-xl bg-background-card border border-border
                 hover:border-accent/50 transition-all group"
    >
      <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-accent/10 border border-accent/30 flex-shrink-0">
        <Globe className="w-4 h-4 text-accent" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-medium bg-accent/10 text-accent rounded border border-accent/30">{index}</span>
          <span className="text-xs text-accent truncate">{source.domain}</span>
          <ExternalLink className="w-3 h-3 text-foreground-muted opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
        <p className="text-sm text-foreground mt-1 line-clamp-2">{source.title}</p>
        {source.snippet && (
          <p className="text-xs text-foreground-muted mt-1 line-clamp-2">
            {source.snippet}
          </p>
        )}
      </div>
    </motion.a>
  )
}
