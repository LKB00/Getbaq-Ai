import { PrimaryButton } from "@/components/Buttons"
import { StatusPill } from "@/components/StatusPill"
import type { ComputedDeadline } from "@/lib/deadlines"
import type { DefiniteConfidence } from "@/components/StatusPill"

interface RuleCardScreenProps {
  ruleLaw: string
  ruleSays: string
  deadline: ComputedDeadline
  confidence: DefiniteConfidence
  confidenceReason: string
  caseTypeLabel: string
  settled?: boolean
  onContinue: () => void
  onNotRight: () => void
}

export function RuleCardScreen({
  ruleLaw,
  ruleSays,
  deadline,
  confidence,
  confidenceReason,
  caseTypeLabel,
  settled = false,
  onContinue,
  onNotRight,
}: RuleCardScreenProps) {
  return (
    <div className="space-y-4 rounded-lg border border-line bg-paper-soft p-4">
      <div>
        <h2 className="text-lg font-semibold">Found the rule</h2>
        <p className="text-xs text-ink-soft mt-1">{caseTypeLabel}</p>
      </div>

      <div className="space-y-3">
        <div>
          <p className="text-xs font-semibold text-ink-soft uppercase">Rule</p>
          <p className="text-sm text-ink">{ruleLaw}</p>
        </div>
        <div>
          <p className="text-xs font-semibold text-ink-soft uppercase">What it says</p>
          <p className="text-sm text-ink">{ruleSays}</p>
        </div>
        <div>
          <p className="text-xs font-semibold text-ink-soft uppercase">Your deadline</p>
          <p className="text-sm text-ink font-mono">{deadline.label}</p>
        </div>
        <div>
          <StatusPill confidence={confidence} />
          <p className="text-xs text-ink-soft mt-2">{confidenceReason}</p>
        </div>
      </div>

      {!settled && (
        <div className="flex gap-2 pt-4">
          <PrimaryButton onClick={onContinue} className="flex-1">Continue</PrimaryButton>
          <button onClick={onNotRight} className="flex-1 rounded-lg border border-line px-4 py-2 text-sm font-semibold hover:bg-line">Not right</button>
        </div>
      )}
    </div>
  )
}
