export function Money({
  amount,
  className,
}: {
  amount: number
  className?: string
}) {
  return (
    <span className={className}>
      ₹{amount.toLocaleString("en-IN")}
    </span>
  )
}

export function Mono({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return <span className={`font-mono ${className || ""}`}>{children}</span>
}
