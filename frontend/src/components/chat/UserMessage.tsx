import { User } from 'lucide-react'

interface UserMessageProps {
  content: string
}

export default function UserMessage({ content }: UserMessageProps) {
  return (
    <div className="flex gap-4 justify-end">
      <div className="max-w-[80%]">
        <div className="bg-accent/10 border border-accent/30 rounded-2xl rounded-tr-sm px-4 py-3">
          <p className="text-foreground whitespace-pre-wrap">{content}</p>
        </div>
      </div>
      <div className="w-8 h-8 rounded-full bg-background-card border border-border flex items-center justify-center flex-shrink-0">
        <User className="w-4 h-4 text-accent" />
      </div>
    </div>
  )
}
