export type DefiniteConfidence = "high" | "medium"

export function StatusPill({ confidence }: { confidence: DefiniteConfidence }) {
  const colors =
    confidence === "high"
      ? "bg-positive/10 text-positive"
      : "bg-brass/10 text-brass"

  return (
    <div className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${colors}`}>
      {confidence === "high" ? "High confidence" : "Medium confidence"}
    </div>
  )
}
