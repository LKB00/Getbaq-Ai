import { PrimaryButton } from "@/components/Buttons"

interface IgnoredScreenProps {
  deadlineLabel: string
  settled?: boolean
  onReviewEscalation: () => void
}

export function IgnoredScreen({ deadlineLabel, settled = false, onReviewEscalation }: IgnoredScreenProps) {
  return (
    <div className="space-y-4 rounded-lg border border-line bg-paper-soft p-4">
      <h2 className="text-lg font-semibold">They went quiet</h2>
      <p className="text-sm text-ink-soft">The deadline of {deadlineLabel} has passed. Time to escalate to the National Consumer Helpline.</p>
      {!settled && <PrimaryButton onClick={onReviewEscalation} className="w-full">Review escalation</PrimaryButton>}
    </div>
  )
}
