import { Money, Mono } from "@/components/Numeral"

interface ResolvedScreenProps {
  company: string
  amount: number
  claimedAmount: number
  days: number
  messagesSent: number
  escalations: number
  caseStudyNumber: number
}

export function ResolvedScreen({
  company,
  amount,
  claimedAmount,
  days,
  messagesSent,
  escalations,
  caseStudyNumber,
}: ResolvedScreenProps) {
  return (
    <div className="space-y-4 rounded-lg border border-brass/40 bg-brand-ink p-6 text-center text-paper">
      <h2 className="text-2xl font-bold">You got your money back.</h2>
      <Money amount={amount} className="text-5xl font-black text-brass" />
      <p className="text-sm">refunded by {company} in <Mono>{days}</Mono> days · <Mono>{messagesSent}</Mono> message sent</p>
    </div>
  )
}
