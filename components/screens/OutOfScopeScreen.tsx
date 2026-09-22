interface OutOfScopeScreenProps {
  outOfScopeReason: string
  whereToGo: string
}

export function OutOfScopeScreen({ outOfScopeReason, whereToGo }: OutOfScopeScreenProps) {
  return (
    <div className="space-y-4 rounded-lg border border-line bg-paper-soft p-4">
      <h2 className="text-lg font-semibold">This one's outside what I can help with</h2>
      <p className="text-sm text-ink">{outOfScopeReason}</p>
      <p className="text-sm text-ink-soft">{whereToGo}</p>
    </div>
  )
}
