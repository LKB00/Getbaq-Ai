"use client"

import { useState } from "react"
import { PrimaryButton, SecondaryButton } from "@/components/Buttons"

interface IntakeIntroProps {
  onSelectChip: (text: string) => void
}

export function IntakeIntro({ onSelectChip }: IntakeIntroProps) {
  const chips = [
    "Flipkart order refund",
    "UPI payment issue",
    "Flight cancellation",
  ]

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-ink">Tell me what happened</h1>
      <p className="text-sm text-ink-soft">
        Paste the chat, email, or screenshot. I'll find the rule and draft the complaint.
      </p>
      <div className="flex flex-wrap gap-2">
        {chips.map((chip) => (
          <SecondaryButton
            key={chip}
            onClick={() => onSelectChip(chip)}
            className="text-xs"
          >
            {chip}
          </SecondaryButton>
        ))}
      </div>
    </div>
  )
}

interface IntakeComposerProps {
  text: string
  setText: (text: string) => void
  demoText?: string
  showDemoShortcuts?: boolean
  disabled?: boolean
  onContinue: (text: string, attachmentUrls: string[]) => void
}

export function IntakeComposer({
  text,
  setText,
  demoText,
  showDemoShortcuts,
  disabled,
  onContinue,
}: IntakeComposerProps) {
  const [attachments, setAttachments] = useState<string[]>([])

  const handleSubmit = () => {
    if (text.trim()) {
      onContinue(text, attachments)
    }
  }

  return (
    <div className="space-y-2">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Paste the chat or screenshot..."
        disabled={disabled}
        className="w-full rounded-lg border border-line bg-paper px-4 py-3 text-sm placeholder-ink-soft focus:border-positive focus:outline-none focus:ring-2 focus:ring-positive/20 disabled:opacity-50"
        rows={3}
      />

      {showDemoShortcuts && demoText && (
        <SecondaryButton
          onClick={() => setText(demoText)}
          className="w-full text-xs"
        >
          Load demo case
        </SecondaryButton>
      )}

      <div className="flex gap-2">
        <PrimaryButton
          onClick={handleSubmit}
          disabled={disabled || !text.trim()}
          className="flex-1"
        >
          Continue
        </PrimaryButton>
      </div>
    </div>
  )
}
