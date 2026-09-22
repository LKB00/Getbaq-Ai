import { PrimaryButton } from "@/components/Buttons"

interface ReplyReadScreenProps {
  reading: string
  verdict: string
  reason: string
  settled?: boolean
  onConfirmResolved: () => void
}

export function ReplyReadScreen({ reading, verdict, reason, settled = false, onConfirmResolved }: ReplyReadScreenProps) {
  return (
    <div className="space-y-4 rounded-lg border border-line bg-paper-soft p-4">
      <h2 className="text-lg font-semibold">Here's what their reply means</h2>

      <div className="rounded bg-paper p-3 space-y-2">
        <p className="text-sm">{reading}</p>
        <p className="text-xs text-ink-soft">Verdict: {verdict}</p>
        <p className="text-xs text-ink-soft">Reason: {reason}</p>
      </div>

      {!settled && <PrimaryButton onClick={onConfirmResolved} className="w-full">Confirm resolved</PrimaryButton>}
    </div>
  )
}
