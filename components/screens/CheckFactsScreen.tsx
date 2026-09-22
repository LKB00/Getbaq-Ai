import { PrimaryButton } from "@/components/Buttons"
import type { Facts } from "@/lib/types"

interface CheckFactsScreenProps {
  facts: Facts
  settled?: boolean
  onConfirm: () => void
}

export function CheckFactsScreen({ facts, settled = false, onConfirm }: CheckFactsScreenProps) {
  return (
    <div className="space-y-4 rounded-lg border border-line bg-paper-soft p-4">
      <h2 className="text-lg font-semibold">Check the facts</h2>
      <p className="text-sm text-ink-soft">Make sure everything is correct before we continue.</p>

      <div className="space-y-3 text-sm">
        <input type="text" defaultValue={facts.company} placeholder="Company" className="w-full rounded border border-line px-3 py-2" />
        <input type="text" defaultValue={facts.amount?.toString()} placeholder="Amount" className="w-full rounded border border-line px-3 py-2" />
        <textarea defaultValue={facts.problem} placeholder="Problem" className="w-full rounded border border-line px-3 py-2" rows={3} />
      </div>

      {!settled && <PrimaryButton onClick={onConfirm} className="w-full">Confirm</PrimaryButton>}
    </div>
  )
}
