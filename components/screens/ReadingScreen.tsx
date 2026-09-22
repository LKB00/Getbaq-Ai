import { PrimaryButton } from "@/components/Buttons"
import type { Facts } from "@/lib/types"

interface ReadingScreenProps {
  facts: Facts
  settled?: boolean
  onContinue: () => void
  onNotRight: () => void
}

export function ReadingScreen({ facts, settled = false, onContinue, onNotRight }: ReadingScreenProps) {
  return (
    <div className="space-y-4 rounded-lg border border-line bg-paper-soft p-4">
      <h2 className="text-lg font-semibold">Making sense of what you sent</h2>

      <div className="space-y-3 text-sm">
        <div>
          <p className="text-xs font-semibold text-ink-soft uppercase">Company</p>
          <p className="text-ink">{facts.company}</p>
        </div>
        <div>
          <p className="text-xs font-semibold text-ink-soft uppercase">Amount</p>
          <p className="text-ink">₹{facts.amount?.toLocaleString("en-IN")}</p>
        </div>
        <div>
          <p className="text-xs font-semibold text-ink-soft uppercase">Problem</p>
          <p className="text-ink">{facts.problem}</p>
        </div>
      </div>

      {!settled && (
        <div className="flex gap-2 pt-4">
          <PrimaryButton onClick={onContinue} className="flex-1">
            Looks right
          </PrimaryButton>
          <button
            onClick={onNotRight}
            className="flex-1 rounded-lg border border-line px-4 py-2 text-sm font-semibold hover:bg-line"
          >
            Not right
          </button>
        </div>
      )}
    </div>
  )
}
