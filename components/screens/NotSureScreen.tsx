interface NotSureScreenProps {
  caseType: string
  reason: string
}

export function NotSureScreen({ caseType, reason }: NotSureScreenProps) {
  return (
    <div className="space-y-4 rounded-lg border border-brass/40 bg-brass/5 p-4">
      <h2 className="text-lg font-semibold">I'm not fully sure about this one</h2>
      <p className="text-sm text-ink-soft">{reason}</p>
    </div>
  )
}
