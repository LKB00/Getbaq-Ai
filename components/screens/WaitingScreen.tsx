import { SecondaryButton } from "@/components/Buttons"
import { Money, Mono } from "@/components/Numeral"
import { Timeline } from "@/components/Timeline"
import type { TimelineStep } from "@/components/Timeline"
import { ReactNode } from "react"

interface WaitingScreenProps {
  deadlineLabel: string
  followUpLabel: string
  steps: TimelineStep[]
  amount: number
  demoReplyText?: string
  showDemoShortcuts?: boolean
  settled?: boolean
  onReplyPasted: () => void
  onResolvedAnotherWay: (amount: number, date: string) => void
}

export function WaitingScreen({
  steps,
  amount,
  demoReplyText,
  showDemoShortcuts,
  settled = false,
  onReplyPasted,
  onResolvedAnotherWay,
}: WaitingScreenProps) {
  return (
    <div className="space-y-4 rounded-lg border border-line bg-paper-soft p-4">
      <h2 className="text-lg font-semibold">Watching for a reply</h2>

      <Timeline steps={steps} />

      {!settled && (
        <div className="space-y-2 pt-4">
          <SecondaryButton onClick={onReplyPasted} className="w-full">Paste their reply</SecondaryButton>
          <SecondaryButton onClick={() => onResolvedAnotherWay(amount, new Date().toISOString().split("T")[0])} className="w-full">Got it resolved another way</SecondaryButton>
          {showDemoShortcuts && demoReplyText && (
            <SecondaryButton onClick={onReplyPasted} className="w-full text-xs">Load demo reply</SecondaryButton>
          )}
        </div>
      )}
    </div>
  )
}
