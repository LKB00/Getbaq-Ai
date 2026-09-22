interface MissingInfoScreenProps {
  question: string
  placeholder: string
}

export function MissingInfoScreen({ question, placeholder }: MissingInfoScreenProps) {
  return (
    <div className="space-y-4 rounded-lg border border-line bg-paper-soft p-4">
      <h2 className="text-lg font-semibold">One thing I need</h2>
      <p className="text-sm text-ink">{question}</p>
      <input type="text" placeholder={placeholder} className="w-full rounded-lg border border-line px-4 py-3 text-sm" />
    </div>
  )
}
