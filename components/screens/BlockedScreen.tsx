import { PrimaryButton } from "@/components/Buttons"
import { Mono } from "@/components/Numeral"

interface BlockedScreenProps {
  fullText: string
  wordCount: number
  settled?: boolean
  onSentItMyself: () => void
}

export function BlockedScreen({ fullText, wordCount, settled = false, onSentItMyself }: BlockedScreenProps) {
  return (
    <div className="space-y-4 rounded-lg border border-line bg-paper-soft p-4">
      <h2 className="text-lg font-semibold">I can't send this one myself</h2>
      <p className="text-sm text-ink-soft">But here's the draft. Send it yourself and let me know when you do.</p>
      <div className="rounded bg-paper p-3">
        <p className="text-sm whitespace-pre-wrap">{fullText.substring(0, 200)}...</p>
        <p className="text-xs text-ink-soft mt-2"><Mono>{wordCount}</Mono> words</p>
      </div>
      {!settled && <PrimaryButton onClick={onSentItMyself} className="w-full">I sent it</PrimaryButton>}
    </div>
  )
}
