import { ReactNode } from "react"

interface AgentLineProps {
  text: ReactNode
  showAvatar?: boolean
}

export function AgentLine({ text, showAvatar = true }: AgentLineProps) {
  return (
    <div className="flex items-start gap-3">
      {showAvatar && (
        <div className="mt-1 h-6 w-6 shrink-0 rounded-full bg-positive/20 flex items-center justify-center text-positive text-xs font-bold">
          →
        </div>
      )}
      <p className="text-sm text-ink-soft leading-relaxed">{text}</p>
    </div>
  )
}
