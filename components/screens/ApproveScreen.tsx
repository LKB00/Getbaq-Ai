import { PrimaryButton, SecondaryButton } from "@/components/Buttons"
import { Money, Mono } from "@/components/Numeral"
import { StatusPill } from "@/components/StatusPill"
import type { ComputedDeadline } from "@/lib/deadlines"
import type { DefiniteConfidence } from "@/components/StatusPill"

interface ApproveScreenProps {
  amount: number
  sendTo: string
  summary: string
  fullText: string
  wordCount: number
  ruleSays: string
  deadline: ComputedDeadline
  confidence: DefiniteConfidence
  confidenceReason: string
  settled?: boolean
  onSend: () => void
  onEdit?: () => void
}

export function ApproveScreen({
  amount,
  sendTo,
  summary,
  fullText,
  wordCount,
  ruleSays,
  deadline,
  confidence,
  confidenceReason,
  settled = false,
  onSend,
  onEdit,
}: ApproveScreenProps) {
  return (
    <div className="space-y-4 rounded-lg border border-line bg-paper-soft p-4">
      <div>
        <h2 className="text-lg font-semibold">Ready to send</h2>
        <p className="text-sm text-ink-soft mt-1">to {sendTo}</p>
      </div>

      <div className="rounded bg-paper p-3 space-y-2 text-sm">
        <p className="font-semibold">{summary}</p>
        <p className="text-ink-soft whitespace-pre-wrap">{fullText.substring(0, 200)}...</p>
        <p className="text-xs text-ink-soft"><Mono>{wordCount}</Mono> words</p>
      </div>

      <div className="space-y-2">
        <StatusPill confidence={confidence} />
        <p className="text-xs text-ink-soft">{confidenceReason}</p>
      </div>

      {!settled && (
        <div className="flex gap-2 pt-4">
          <PrimaryButton onClick={onSend} className="flex-1">Send now</PrimaryButton>
          {onEdit && <SecondaryButton onClick={onEdit} className="flex-1">Edit</SecondaryButton>}
        </div>
      )}
    </div>
  )
}
