interface SentMessageProps {
  text: string
  attachmentUrls?: string[]
}

export function SentMessage({ text, attachmentUrls = [] }: SentMessageProps) {
  return (
    <div className="flex justify-end">
      <div className="max-w-xs rounded-lg bg-positive px-4 py-3 text-paper">
        <p className="text-sm leading-relaxed">{text}</p>
        {attachmentUrls.length > 0 && (
          <div className="mt-2 space-y-2">
            {attachmentUrls.map((url, i) => (
              <p key={i} className="text-xs opacity-80">
                📎 {url}
              </p>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
